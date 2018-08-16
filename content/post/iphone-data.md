---
draft: true
tags:
- code
- mobile
- data
title: On making a dead sms thread alive!
url: iphone-sms-alive
---

iOS sms threads are mostly dead things that contain a whole lot of intimacy. It’s a shame that it
is so hard to navigate through them to revive some memories.

Let’s see how to give them a second youth that will last, well, forever.

# Data

Before looking at how to make a sms thread lively, we need to get the data which is not the easiest
thing on earth. Information on how to do this can be found on the web rather easily (even though
I never found a single post explaining how to process iOS backups form A to Z).

This is just a small recap on where to find iOS backup data and a bit of how to manipulate it.
Let’s play with iOS backup data to reconstruct (and export) the full thread of discussion with a
contact.


## Accessing the data

Backups are stored in `${HOME}/Library/Application\ Support/MobileSync/Backup/`.

As we do not want to alter the backups while playing with them, we'll first make a copy of the files
(all sqlite databases) somewhere safe. Beware that your sms pretty surely contain a lot of very
intimate data and you do not want to leave this data in an uncontrolled environment.


```bash

function sync_backup {
    local sync_dir="$1"

    local backup_dir=${HOME}/Library/Application\ Support/MobileSync/Backup/
    local backup_uid="$( ls -1t "${backup_dir}" | head -1 )"
    local backup="${backup_dir}/${backup_uid}"

    scp "${backup}/3d0d7e5fb2ce288813306e4d4636395e047a3d28" "${sync_dir}"  # sms
    scp "${backup}/2b2b0084a1bc3a5ac8c27afdf14afb42c61a19ca" "${sync_dir}"  # call history
    scp "${backup}/31bb7ba8914766d4ba40d6dfb6113c8b614be442" "${sync_dir}"  # contacts
    scp "${backup}/2041457d5fe04d39d0ab481178355df6781e6858" "${sync_dir}"  # calendar + reminders
    scp "${backup}/4096c9ec676f2847dc283405900e284a7c815836" "${sync_dir}"  # locations
    scp "${backup}/ca3bc056d4da0bbf88b5fb3be254f3b7147e639c" "${sync_dir}"  # notes
    scp "${backup}/Info.plist"                               "${sync_dir}"
    scp "${backup}/Manifest.plist"                           "${sync_dir}"
    scp "${backup}/Manifest.mbdb"                            "${sync_dir}"
}
```

## Decrypting encrypted backups

It is considered a best practice to encrypt backups with a password (see
[iTunes documentation](https://support.apple.com/en-us/HT205220)).

To access encrypted data, we must first decrypt the files; see
http://stackoverflow.com/a/13793043/626278 for a nice explanation (with good advice on why you should
**not** decrypt this data and be aware of the security risks) on how to do this.

```bash

function decrypt_backup {
    local encrypted_dir="$1"
    local decrypted_dir="$2"
    local tmp_dir="$( mkdtemp -d )"

    # dependency for iphone-dataprotection
    pip install --user pycrypto
    # iphone-dataprotection is hosted on google code which is no longer alive but
    # still provide code archives
    curl https://storage.googleapis.com/google-code-archive-source/v2/code.google.com/iphone-dataprotection/source-archive.zip -o /tmp/iphone-dataprotection.zip

    # let's decrypt the backup
    ( cd /tmp/ &&
    unzip iphone-dataprotection.zip &&
    python iphone-dataprotection/python_scripts/backup_tool.py "${encrypted_dir}" "${tmp_dir}" )

    # move the needed databases aside
    for db in sms.db \
              call_history.db \
              AddressBook.sqlitedb \
              Calendar.sqlitedb \
              consolidated.db \
              notes.sqlite.db
    do
        find "${tmp_dir}" -name  -exec mv {} "${decrypted_dir}/" \;
    done

    # and wipe everything else
    rm -fr /tmp/iphone-dataprotection /tmp/iphone-dataprotection.zip "${tmp_dir}"
}
```


## Photo storage:

* sms attachements: `Library/SMS/Attachments/*`

## Finding all known numbers for a contact

People tend to change phone numbers (be it because they change job and use their professional number
to send you texts). We therefore first need to find all numbers that have been used by our contact.

Contacts data is stored in the `31bb7ba8914766d4ba40d6dfb6113c8b614be442` database which should be
renamed in `AddressBook.sqlitedb` after decryption.

See [gist](https://gist.github.com/laacz/1180765):

```python
    def numbers(connection, first, last):
        cursor = connection.execute('''
SELECT (select value from ABMultiValue
        where property = 3 and
              record_id = ABPerson.ROWID and
              label = (select ROWID from ABMultiValueLabel where value = '_$!<Work>!$_')) as phone_work
     , (select value from ABMultiValue
        where property = 3 and
              record_id = ABPerson.ROWID and
              label = (select ROWID from ABMultiValueLabel where value = '_$!<Mobile>!$_')) as phone_mobile
     , (select value from ABMultiValue
        where property = 3 and
              record_id = ABPerson.ROWID and
              label = (select ROWID from ABMultiValueLabel where value = '_$!<Home>!$_')) as phone_home
FROM ABPerson
WHERE First = ? AND Last = ?
        ''', (first, last))
        numbers = filter(None,
                         reduce(lambda x, y: x + y,
                                map(tuple, cursor.fetchall()),
                                tuple()))
        numberify = re.compile(r'[^\d+]+')
        return map(lambda num: numberify.sub('', num), numbers)
```


## Data to book

* http://tex.stackexchange.com/a/239511
* http://tex.stackexchange.com/questions/266713/resemble-popular-messenger-with-latex-macros
* http://tex.stackexchange.com/questions/270252/boxes-for-sms-conversation
