import psycopg2

from config import config

def db_setup():
    conn = psycopg2.connect(user=config['postgresql']['user'], password=config['postgresql']['password'], host=config['postgresql']['host'], port=config['postgresql']['port'])
    with conn.cursor() as cur:
        conn.autocommit = True
        cur.execute('DROP DATABASE IF EXISTS "%s";' % (config['postgresql']['dbname'], ))
        cur.execute('CREATE DATABASE "%s";' % (config['postgresql']['dbname'], ))
    conn.close()

    conn = psycopg2.connect(dbname=config['postgresql']['dbname'], user=config['postgresql']['user'], password=config['postgresql']['password'], host=config['postgresql']['host'], port=config['postgresql']['port'])
    with conn.cursor() as cur:
        conn.autocommit = True
        with open('./sql/setup_db.sql', 'r') as sql_file:
            cur.execute(sql_file.read())
    conn.close()

    print('[✓] Database initializated')