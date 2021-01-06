from config import config
import psycopg2
from pypika import Query, Table, Field


def get_sql_connection():
    connection = psycopg2.connect(dbname=config['postgresql']['dbname'], user=config['postgresql']['user'], password=config['postgresql']['password'], host=config['postgresql']['host'], port=config['postgresql']['port'])
    cursor = connection.cursor()
    return connection, cursor


def push_msg(connection, cursor, row, table):
    table = Table(table)
    q = Query.into(table).columns(*row.keys()).insert(*row.values())
    cursor.execute(str(q))
    connection.commit()
