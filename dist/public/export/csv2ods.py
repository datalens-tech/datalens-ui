import io
from itertools import chain
import pandas as pd
from stream_write_ods import stream_write_ods
import sys

def read_args():
    """
    Чтение аргументов из командной строки

    Результат:
    ----------
    Словарь с параметрами
    """
    params = {}
    for i in range(0, len(sys.argv)):
        arg = sys.argv[i].split('=')
        
        if len(arg) > 1:
            params[arg[0].replace('\"', '')] = arg[1].replace('\"', '')

    return params

def get_sheets(reader):
    columns = None

    def get_rows():
        nonlocal columns

        for chunk in reader:
            if columns is None:
                columns = tuple(chunk.columns.tolist())
            yield from (row for index, row in chunk.iterrows())

    rows = get_rows()
    first_row = next(rows)

    yield 'Sheet 1', columns, chain((first_row,), rows)

params = read_args()

csv_file = io.open(params['FILE_PATH'], mode="r", encoding="utf-8")

with pd.read_csv(csv_file, sep=';', chunksize=1024) as reader:
    ods_chunks = stream_write_ods(get_sheets(reader))
    data = b''.join(ods_chunks)

    with open(params['FILE_PATH'].replace(".csv", ".ods"), 'wb') as w:
        w.write(data)