# "python3 dash2sheets.py OUTPUT_NAME=output.xlsx SEP=; ./temp/file1.csv ./temp/file2.csv"
#
# Python скрипт для объединения нескольких CSV файлов в один XLSX
# 
# Параметры:
# - OUTPUT_NAME: string - выходной файл
# - SEP: string - разделитель CSV 
# - далее следует список CSV файлов

import pandas as pd
import sys
import os

def read_args():
    """
    Чтение аргументов из командной строки

    Результат:
    ----------
    Словарь с параметрами
    """

    params = {}

    new_argv = sys.argv[1:3]

    for i in range(0, len(new_argv)):
        arg = new_argv[i].split('=')
        
        if len(arg) > 1:
            params[arg[0].replace('\"', '')] = arg[1].replace('\"', '')

    return params

params = read_args()

with pd.ExcelWriter(params["OUTPUT_NAME"]) as writer:
    for csvfilename in sys.argv[3:]:
        df = pd.read_csv(csvfilename, sep=params["SEP"])
        file_name = os.path.basename(csvfilename)
        sheet_name = os.path.splitext(file_name)[0]
        # Excel worksheet name must be <= 31 chars.
        df.to_excel(writer,sheet_name=sheet_name.split(sep='-')[0][:32], index=False)