---
date: 2018-08-17
tags:
- citus
- postgres
- docker
title: "Running Citus in Docker"
description: "Notes on how to run Citus extension for Postgresql locally (in Docker)"
url: running-citus-locally/
---

[Citus](https://citusdata.com) is an [open-source](https://github.com/citusdata/citus) [PostgreSQL](https://www.postgresql.org/) extension to distribute tables and queries on multiple shards.
The extension requires a master node aka the [coordinator](http://docs.citusdata.com/en/v7.5/get_started/concepts.html#nodes-coordinator-and-workers) whose role is to forward queries to workers — that actually store data — and gather results.

While using [CitusCloud](https://www.citusdata.com/product/cloud) to run Citus in production is probably the best idea, it is less true for local or testing environments as network adds latency and concurrent builds require hacks (like creating random [`schema`s](https://www.postgresql.org/docs/10/static/ddl-schemas.html) for each build). Relying on a local running Citus cluster in a Docker environment provides a clean solution to this problem.

Citus has been providing a Docker image for a while but only recently included some of their major extensions: [`hll`](https://github.com/citusdata/postgresql-hll) and [`topn`](https://github.com/citusdata/postgresql-topn). This could be the end of the story however, as everything is database-scoped with PostgreSQL, things are a bit more painful to setup.

> A PostgreSQL database cluster contains one or more named databases. Users and groups of users are shared across the entire cluster, but no other data is shared across databases. Any given client connection to the server can access only the data in a single database, the one specified in the connection request.
>
> <cite>[Postgresql documentation](https://www.postgresql.org/docs/10/static/ddl-schemas.html)</cite>

Let’s see how to handle a local Citus cluster.


# Fiddling

First things first, let's start a Citus cluster with at least 2 workers (this assumes that [`docker`](https://docs.docker.com/install/) and [`docker-compose`](https://docs.docker.com/compose/install/) are available locally):

```bash
curl https://raw.githubusercontent.com/citusdata/docker/master/docker-compose.yml >docker-compose.yml
docker-compose -p citus up --scale worker=2 -d
```

The image only provides the default role and database so by default, as only master exposes a port, we'll have to use

* `psql postgres://postgres@localhost:5432?sslmode=disable` to connect to the master node;
* `docker exec -t citus_worker_1 psql postgres://postgres@localhost:5432?sslmode=disable` to connect to a worker node.

Let's start by creating a `citus` role and `citus` database. As Citus does not automatically forward the call to the workers, we have to call [`run_command_on_workers`](http://docs.citusdata.com/en/v7.5/develop/reference_propagation.html#running-on-all-workers):

```bash
psql postgres://postgres@localhost:5432?sslmode=disable <<EOQ
  CREATE ROLE citus WITH LOGIN IN ROLE pg_monitor;
  SELECT run_command_on_workers('CREATE ROLE citus WITH LOGIN IN ROLE pg_monitor');

  CREATE DATABASE citus WITH OWNER citus;
  SELECT run_command_on_workers('CREATE DATABASE citus WITH OWNER=citus');
EOQ
```
Alternatively, we could execute the same command by connecting on all the nodes successively.

As extensions are installed per database, we should now install the desired extensions (including the `citus` one) for our freshly created database:
```bash
psql postgres://postgres@localhost:5432/citus?sslmode=disable <<EOQ
  CREATE EXTENSION IF NOT EXISTS "citus";
  CREATE EXTENSION IF NOT EXISTS "hll";
  CREATE EXTENSION IF NOT EXISTS "topn";
EOQ
```

Now the coordinator is ready; it has a custom user, a custom database and the needed extensions. However, as everything is database scoped, the 2 workers are not attached for the `citus` database:
```bash
# this is the default database:
$ psql postgres://postgres@localhost:5432?sslmode=disable -c 'SELECT * FROM master_get_active_worker_nodes()';
   node_name    | node_port
----------------+-----------
 citus_worker_2 |      5432
 citus_worker_1 |      5432
(2 rows)

# this is our new database:
$ psql postgres://postgres@localhost:5432/citus?sslmode=disable -c 'SELECT * FROM master_get_active_worker_nodes()';
 node_name | node_port
-----------+-----------
(0 rows)
```

Using [`docker inspect`](https://docs.docker.com/engine/reference/commandline/inspect/#get-an-instances-ip-address) easily allows to retrieve the worker ips to attach them to our database:
```bash
worker1_ip="$( docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' citus_worker_1 )"
worker2_ip="$( docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' citus_worker_2 )"

psql postgres://postgres@localhost:5432/citus?sslmode=disable <<EOQ
  SELECT * from master_add_node('${worker1_ip}', 5432);
  SELECT * from master_add_node('${worker2_ip}', 5432);
EOQ
```

Finally, workers need to be setup for the `citus` database:
```bash
psql postgres://postgres@localhost:5432/citus?sslmode=disable <<EOQ
 SELECT run_command_on_workers('CREATE EXTENSION IF NOT EXISTS "citus"');
 SELECT run_command_on_workers('CREATE EXTENSION IF NOT EXISTS "hll"');
 SELECT run_command_on_workers('CREATE EXTENSION IF NOT EXISTS "topn"');
EOQ
```

And we are now done! Running all these steps takes 10-ish seconds on a recent laptop which is good enough if we consider that we do not have to start and stop a local cluster all the time.

We can now “normally” interact with the cluster (and query both the coordinator and workers):

```bash
$ psql postgres://citus@localhost:5432/citus?sslmode=disable -c 'select * FROM master_get_active_worker_nodes();'
   node_name   | node_port
---------------+-----------
 192.168.144.5 |      5432
 192.168.144.4 |      5432
(2 rows)

$ psql postgres://citus@localhost:5432/citus?sslmode=disable -c '\dx'
                    List of installed extensions
  Name   | Version |   Schema   |            Description
---------+---------+------------+-----------------------------------
 citus   | 7.5-7   | pg_catalog | Citus distributed database
 hll     | 2.10    | public     | type for storing hyperloglog data
 plpgsql | 1.0     | pg_catalog | PL/pgSQL procedural language
 topn    | 2.0.0   | public     | type for top-n JSONB
(4 rows)

$ psql postgres://citus@localhost:5432/citus?sslmode=disable -c '\d+'
Did not find any relations.

$ docker exec -it citus_worker_1 psql postgres://citus@localhost:5432/citus?sslmode=disable -c "\dx"
                    List of installed extensions
  Name   | Version |   Schema   |            Description
---------+---------+------------+-----------------------------------
 citus   | 7.5-7   | pg_catalog | Citus distributed database
 hll     | 2.10    | public     | type for storing hyperloglog data
 plpgsql | 1.0     | pg_catalog | PL/pgSQL procedural language
 topn    | 2.0.0   | public     | type for top-n JSONB
(4 rows)
```

Fiddling script available as a [gist](https://gist.github.com/marchelbling/8a0b47e82d0993c8a5a4726611d5ccfd).


# Using Citus in Docker: the clean approach.

The previous was good to better understand how to interact with a Citus cluster but this is far from practical:

* the process is notably cumbersome as most steps have to be executed both on the coordinator and the workers in separate calls;
* as a consequence, the proposed script uses duplicated lists which is error-prone;
* the manager is completely useless in the previous approach as we switch database and have to attach workers manually; as a consequence, if we were to add more workers, we would have to declare our custom role/database, install extensions and attach them to the master, all that manually.

The Citus image is based on the official [Postgres Docker image](https://hub.docker.com/_/postgres/) that comes with lots of customization options and this will allow us to have a clean and scalable way of running our local cluster.

The first option that we want to use is the environment variable `POSTGRES_DB`; setting `POSTGRES_DB=citus`:

```bash
version: '2.1'

services:
  master:
    container_name: "${COMPOSE_PROJECT_NAME:-citus}_master"
    image: 'local-citus:latest'
    ports: ["${MASTER_EXTERNAL_PORT:-5432}:5432"]
    labels: ['com.citusdata.role=Master']
	environment:
    - POSTGRES_DB=citus
  worker:
    image: 'local-citus:latest'
    labels: ['com.citusdata.role=Worker']
    depends_on: { manager: { condition: service_healthy } }
	environment:
    - POSTGRES_DB=citus
  manager:
    container_name: "${COMPOSE_PROJECT_NAME:-citus}_manager"
    image: 'citusdata/membership-manager:0.2.0'
    volumes: ['/var/run/docker.sock:/var/run/docker.sock']
    depends_on: { master: { condition: service_healthy } }
	environment:
    - POSTGRES_DB=citus
```

will use the `citus` database by default and create it if needed.
Note that the environment has to be defined on all services to work as expected; now the manager will be able to attach new workers to the master node automatically.

The other handy option is the `/docker-entrypoint-initdb.d/` that allows to customize how the PostgreSQL instance should behave. Any SQL or Bash script will be executed before starting the service. This can be used to

1. create our custom role,
2. transfer owernship of the database to our custom role,
3. install custom extensions.

All we have to do is “wrap” the Citus Docker image and inject our own script. Let's write a simple Dockerfile for this:

```bash
FROM citusdata/citus:7.5.0

COPY 100-local-citus.sql /docker-entrypoint-initdb.d/
```

where the `100-local-citus.sql` could simply be:

```sql
-- user:
CREATE ROLE citus WITH NOSUPERUSER LOGIN IN ROLE pg_monitor;

-- database:
ALTER DATABASE citus OWNER TO citus;

-- extensions:
CREATE EXTENSION IF NOT EXISTS "hll";
CREATE EXTENSION IF NOT EXISTS "topn";
```

Now after building the image (`docker build -t local-citus:latest .`) we can start a cluster using the same command as before:
`docker-compose -p citus up --scale worker=2 -d`. Before the container is taking connections, all our custom setup will be executed and the manager will attach workers to the master. This solution is not more time consuming and solves all the previous issues.

Configuration available as a [gist](https://gist.github.com/marchelbling/1ef4ae74c3d5bd745a04f7b8ae375f8a).
