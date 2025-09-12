<img width="100%" src="https://github.com/user-attachments/assets/67cae81f-bee6-4112-85df-e4b07e1df06c" />

margaret-gesner
========
Simple app for managing database as tables.
Current stack:
``flask``
``MySQL``
``vanila``

requirements
------------
* ``flask[async]``
* ``mysql-connector-python`` 9.4.0
* ``python-dotenv`` 1.1.1

installation
------------
``git clone https://github.com/longdeer/margaret-gesner.git``

configuration
-------------
suggests ``.env`` content:
```
# server configuration
APP_NAME=$PWD/client
APP_STATIC_FOLDER=$PWD/client
APP_TEMPLATES_FOLDER=
LISTEN_ADDRESS=ip
LISTEN_PORT=port
LOGGY_FILE=path
LOGGY_LEVEL=10-50
# database configuration
DB_ACCESS_LIST='["ip1","ip2",...]'
DB_NAME=string
DB_ADDRESS=ip
DB_USER_NAME=string
DB_USER_PASSWORD=string
DB_STRUCTURE_TABLE=string
# optional locale language messages
NEW_TABLE_ALIAS=string
RADIO_TEXT=string
RADIO_DATE=string
RADIO_NUMBER=string
ITEM_ROW_PLACEHOLDER=string
ITEM_DATE_TYPE_PLACEHOLDER=string
ITEM_DELETE_TITLE=string
ITEM_EDIT_TITLE=string
ITEM_NEW_TABLE_TITLE=string
ITEM_OPEN_TABLE_TITLE=string
ITEM_BACK_TO_STRUCTURE_TITLE=string
ITEM_SUBMIT_NEW_ROW_TITLE=string
ITEM_CANCEL_EDIT_TITLE=string
ITEM_SUBMIT_ROW_UPDATE_TITLE=string
ITEM_DELETE_ROW_TITLE=string
ITEM_EDIT_ROW_TITLE=string
ITEM_DELETE_COLUMN_TITLE=string
ITEM_NEW_TABLE_COLUMN_TITLE=string
ITEM_SUBMIT_NEW_TABLE_TITLE=string
ITEM_SORTING_TOGGLE_TITLE=string
ALERT_UNHANDLED_STATUS=string
ALERT_RELOAD_TO_VIEW=string
ALERT_SAME_CONTENT_UPDATE=string
ALERT_NO_TABLE_NAME=string
ALERT_NO_COLUMN_NAME=string
ALERT_IMPROPER_COLUMN_NAME=string
ALERT_TABLE_NOT_MODFIED=string
CONFIRM_TABLE_NEW_ROW=string
CONFIRM_TABLE_DELETE_ROW=string
CONFIRM_TABLE_UPDATE_ROW=string
CONFIRM_NEW_TABLE=string
CONFIRM_DELETE_TABLE=string
CONFIRM_MODIFY_TABLE=string
```
