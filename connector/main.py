from config import config
from db_setup import db_setup
from worker import Workers
import multiprocessing


def main():
    # initialize the database by creating db + tables
    db_setup()

    workers = Workers()

if __name__ == "__main__":
    main()