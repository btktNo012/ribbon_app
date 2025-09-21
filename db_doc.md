RIBBON_MASTER(リボンマスタ)

| カラム名         | 日本語名   | データ型         | PK | 制約       | DEFAULT                                      | 備考                  |
| ------------ | ------ | ------------ | -- | -------- | -------------------------------------------- | ------------------- |
| ribbon_id   | リボンID  | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('ribbon_id_seq')::text,8,'0')` | リボンを一意に特定するID       |
| ribbon_name | 名前     | VARCHAR(128) |    |          | NULL                                         | リボンの名前              |
| title        | 二つ名    | VARCHAR(128) |    |          | NULL                                         | リボンを設定したことで表示される二つ名 |
| created_at  | 新規登録日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                        | 新規登録日時              |
| updated_at  | 最終更新日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                        | 最終更新日時              |


GENERATION_MASTER(世代マスタ)

| カラム名             | 日本語名   | データ型         | PK | 制約       | DEFAULT                                          | 備考           |
| ---------------- | ------ | ------------ | -- | -------- | ------------------------------------------------ | ------------ |
| generation_id   | 世代ID   | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('generation_id_seq')::text,8,'0')` | 世代を一意に特定するID |
| generation_name | 世代名    | VARCHAR(128) |    |          | NULL                                             | 世代の名前        |
| created_at      | 新規登録日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                            | 新規登録日時       |
| updated_at      | 最終更新日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                            | 最終更新日時       |


RIBBON_GET_ROUTE_INFO(リボン入手経路情報)

| カラム名               | 日本語名    | データ型         | PK | 制約       | DEFAULT | 備考                |
| ------------------ | ------- | ------------ | -- | -------- | ------- | ----------------- |
| ribbon_id         | リボンID   | VARCHAR(8)   | o  | NOT NULL | なし      | リボンを一意に特定するID     |
| generation_id     | 世代ID    | VARCHAR(8)   | o  | NOT NULL | なし      | 世代を一意に特定するID      |
| get_route         | 入手方法    | VARCHAR(256) |    |          | NULL    | 入手方法の説明文          |
| limit_legend_flg | 禁止伝説フラグ | BOOLEAN      |    | NOT NULL | false   | true:禁止伝説の場合は入手不可 |
| level_limit       | 制限レベル   | SMALLINT     |    |          | NULL    | 入手可能なレベルの最小値      |
| innate_flg        | 特殊リボンフラグ | BOOLEAN     |    |          | NULL    | true:配信ポケモンの持っているリボンなどの先天的なリボン |
| created_at        | 新規登録日時  | TIMESTAMPTZ  |    | NOT NULL | now()   | 新規登録日時            |
| updated_at        | 最終更新日時  | TIMESTAMPTZ  |    | NOT NULL | now()   | 最終更新日時            |

POKEMON_MASTER(ポケモンマスタ)

| カラム名               | 日本語名    | データ型         | PK | 制約       | DEFAULT                                       | 備考                |
| ------------------ | ------- | ------------ | -- | -------- | --------------------------------------------- | ----------------- |
| pokemon_id        | ポケモンID  | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('pokemon_id_seq')::text,8,'0')` | ポケモンを一意に特定するID    |
| pokemon_name      | ポケモン名   | VARCHAR(128) |    |          | NULL                                          | ポケモンの名前（フォルム名を含む） |
| limit_legend_flg | 禁止伝説フラグ | BOOLEAN      |    | NOT NULL | false                                         | true:禁止伝説         |
| created_at        | 新規登録日時  | TIMESTAMPTZ  |    | NOT NULL | now()                                         | 新規登録日時            |
| updated_at        | 最終更新日時  | TIMESTAMPTZ  |    | NOT NULL | now()                                         | 最終更新日時            |

POKEMON_GENERATION_INFO(ポケモン登場世代情報)

| カラム名           | 日本語名   | データ型        | PK | 制約       | DEFAULT | 備考             |
| -------------- | ------ | ----------- | -- | -------- | ------- | -------------- |
| pokemon_id    | ポケモンID | VARCHAR(8)  | o  | NOT NULL | なし      | ポケモンを一意に特定するID |
| generation_id | 世代ID   | VARCHAR(8)  | o  | NOT NULL | なし      | 世代を一意に特定するID   |
| created_at    | 新規登録日時 | TIMESTAMPTZ |    | NOT NULL | now()   | 新規登録日時         |
| updated_at    | 最終更新日時 | TIMESTAMPTZ |    | NOT NULL | now()   | 最終更新日時         |


GENERATION_MOVE_INFO(世代移動情報)

| カラム名                 | 日本語名     | データ型        | PK | 制約       | DEFAULT | 備考                   |
| -------------------- | -------- | ----------- | -- | -------- | ------- | -------------------- |
| now_generation_id  | 現在の世代ID  | VARCHAR(8)  | o  | NOT NULL | なし      | 移動元の世代ID             |
| move_generation_id | 移動先の世代ID | VARCHAR(8)  | o  | NOT NULL | なし      | 移動元の世代に対して移動可能な世代のID |
| one_way_flg        | 一方通行フラグ  | BOOLEAN     |    | NOT NULL | false   | true:移動したら戻すことはできない  |
| created_at          | 新規登録日時   | TIMESTAMPTZ |    | NOT NULL | now()   | 新規登録日時               |
| updated_at          | 最終更新日時   | TIMESTAMPTZ |    | NOT NULL | now()   | 最終更新日時               |

USER_INFO(ユーザ情報)

| カラム名        | 日本語名   | データ型         | PK | 制約       | DEFAULT                                    | 備考            |
| ----------- | ------ | ------------ | -- | -------- | ------------------------------------------ | ------------- |
| user_id    | ユーザID  | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('user_id_seq')::text,8,'0')` | ユーザを一意に特定するID |
| user_name  | ユーザ名   | VARCHAR(128) |    |          | NULL                                       | ユーザの名前        |
| created_at | 新規登録日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                      | 新規登録日時        |
| updated_at | 最終更新日時 | TIMESTAMPTZ  |    | NOT NULL | now()                                      | 最終更新日時        |

USER_POKEMON_INFO(ユーザのポケモン情報)

| カラム名                | 日本語名         | データ型         | PK | 制約       | DEFAULT                                            | 備考                 |
| ------------------- | ------------ | ------------ | -- | -------- | -------------------------------------------------- | ------------------ |
| user_pokemon_id   | ユーザのポケモン情報ID | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('user_pokemon_id_seq')::text,8,'0')` | ユーザのポケモンを一意に特定するID |
| user_id            | ユーザID        | VARCHAR(8)   |    | NOT NULL | なし                                                 | ユーザを一意に特定するID      |
| pokemon_id         | ポケモンID       | VARCHAR(8)   |    | NOT NULL | なし                                                 | ポケモンを一意に特定するID     |
| nickname            | ニックネーム       | VARCHAR(128) |    |          | NULL                                               | ニックネーム             |
| met_level          | 入手レベル        | SMALLINT     |    | NOT NULL | 50                                                  | 入手時点のレベル           |
| now_generation_id | 現在の世代ID      | VARCHAR(8)   |    |          | NULL                                               | 現在いる世代のID          |
| created_at         | 新規登録日時       | TIMESTAMPTZ  |    | NOT NULL | now()                                              | 新規登録日時             |
| updated_at         | 最終更新日時       | TIMESTAMPTZ  |    | NOT NULL | now()                                              | 最終更新日時             |

USER_POKEMON_RIBBON_INFO(ユーザのポケモンの所持リボン情報)

| カラム名                      | 日本語名             | データ型        | PK | 制約       | DEFAULT                                                   | 備考                       |
| ------------------------- | ---------------- | ----------- | -- | -------- | --------------------------------------------------------- | ------------------------ |
| user_pokemon_ribbon_id | ユーザのポケモンの所持リボンID | VARCHAR(8)  | o  | NOT NULL | `lpad(nextval('user_pokemon_ribbon_id_seq')::text,8,'0')` | ユーザのポケモンの所持リボンを一意に特定するID |
| user_pokemon_id         | ユーザのポケモン情報ID     | VARCHAR(8)  | o  | NOT NULL | なし                                                        | ユーザのポケモンを一意に特定するID       |
| ribbon_id                | リボンID            | VARCHAR(8)  | o  | NOT NULL | なし                                                        | リボンを一意に特定するID            |
| equipped                  | リボン装備フラグ         | BOOLEAN     |    | NOT NULL | false                                                     | true:このリボンを付けている         |
| created_at               | 新規登録日時           | TIMESTAMPTZ |    | NOT NULL | now()                                                     | 新規登録日時                   |
| updated_at               | 最終更新日時           | TIMESTAMPTZ |    | NOT NULL | now()                                                     | 最終更新日時                   |

RIBBON_GENERATION_MAP(世代別リボン存在マップ)

| カラム名           | 日本語名   | データ型        | PK | 制約       | DEFAULT | 備考                         |
| -------------- | ------ | ----------- | -- | -------- | ------- | -------------------------- |
| ribbon_id     | リボンID  | VARCHAR(8)  | o  | NOT NULL | なし      | リボンを一意に特定するID              |
| generation_id | 世代ID   | VARCHAR(8)  | o  | NOT NULL | なし      | 世代を一意に特定するID               |
| is_available  | 存在フラグ  | BOOLEAN     |    | NOT NULL | true    | 第n世代でこのリボンが**存在／取得対象**かどうか |
| notes          | 補足     | TEXT        |    |          | NULL    | 表示用メモなど（任意）                |
| created_at    | 新規登録日時 | TIMESTAMPTZ |    | NOT NULL | now()   | 新規登録日時                     |
| updated_at    | 最終更新日時 | TIMESTAMPTZ |    | NOT NULL | now()   | 最終更新日時                     |

OAUTH_ACCOUNT(OAuthアカウント連携)

| カラム名               | 日本語名         | データ型         | PK | 制約       | DEFAULT                                             | 備考                        |
| ------------------ | ------------ | ------------ | -- | -------- | --------------------------------------------------- | ------------------------- |
| oauth_account_id | OAuthアカウントID | VARCHAR(8)   | o  | NOT NULL | `lpad(nextval('oauth_account_id_seq')::text,8,'0')` | 主キー                       |
| user_id           | ユーザID        | VARCHAR(8)   |    | NOT NULL | なし                                                  | `USER_INFO.user_id` を参照   |
| provider           | プロバイダ        | VARCHAR(32)  |    | NOT NULL | なし                                                  | 例：`google`, `x`（旧twitter） |
| provider_user_id | プロバイダ側ユーザID  | VARCHAR(128) |    | NOT NULL | なし                                                  | 外部プロバイダのユーザ識別子            |
| email              | メールアドレス      | VARCHAR(256) |    |          | NULL                                                | プロバイダから取得できた場合のみ          |
| linked_at         | 連携日時         | TIMESTAMPTZ  |    | NOT NULL | now()                                               | 連携作成時刻                    |
| created_at        | 新規登録日時       | TIMESTAMPTZ  |    | NOT NULL | now()                                               | 新規登録日時                    |
| updated_at        | 最終更新日時       | TIMESTAMPTZ  |    | NOT NULL | now()                                               | 最終更新日時                    |
