---
date: 2018-08-16:00:00Z
tags:
- citus
- postgres
- docker
title: "Running Citus locally"
description: "Notes on how to run Citus extension for Postgresql locally (in docker)"
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

First things first, let's start a Citus cluster with at least 2 workers (this assumes that [`docker`](https://docs.docker.com/install/) and [`docker-compose`](https://docs.docker.com/compose/install/) are available locally):

```bash
curl https://raw.githubusercontent.com/citusdata/docker/master/docker-compose.yml >docker-compose.yml
docker-compose -p citus up --scale worker=2 -d
```

The image only provides the default role and database; let's start by creating a `citus` role and `citus` database:

```bash
psql postgres://postgres@localhost:5432?sslmode=disable <<EOQ
  CREATE ROLE citus WITH LOGIN IN ROLE pg_monitor;
  SELECT run_command_on_workers('CREATE ROLE citus WITH LOGIN IN ROLE pg_monitor');

  CREATE DATABASE citus WITH OWNER citus;
  SELECT run_command_on_workers('CREATE DATABASE citus WITH OWNER=citus');
EOQ
```

As extensions are installed per database, we should now install the desired extensions (including the `citus` one) for the `citus` database:
```bash
psql postgres://postgres@localhost:5432/citus?sslmode=disable <<EOQ
  CREATE EXTENSION IF NOT EXISTS "citus";
  CREATE EXTENSION IF NOT EXISTS "hll";
  CREATE EXTENSION IF NOT EXISTS "topn";
EOQ
```

Now the coordinator is ready; it has a custom user, a custom database and the needed extensions. However, as everything is database scoped, the 2 workers are not attached for the `citus` database:
```bash
$ psql postgres://postgres@localhost:5432?sslmode=disable -c 'SELECT * FROM master_get_active_worker_nodes()';
   node_name    | node_port
----------------+-----------
 citus_worker_2 |      5432
 citus_worker_1 |      5432
(2 rows)

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

And we are now done!

Some remarks:

* the process is notably cumbersome as most steps have to be executed both on the coordinator and the workers in separate calls; the proposed script uses duplicated lists which is not great however as extensions are probably not updated so regularly this is likely good enough.
* all steps require the use of the `postgres` role as our custom role is not a superuser (which is safer).
* a 2-workers cluster takes 10-ish seconds on a recent laptop which is decent enough, especially for a local environment where the cluster doesn't need to go down regularly.

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

Script available as a [gist](https://gist.github.com/marchelbling/8a0b47e82d0993c8a5a4726611d5ccfd).
