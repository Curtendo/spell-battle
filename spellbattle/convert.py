import sqlite3
import pandas as pd

def csv_to_sqlite(csv_path, db_path, table_name):
    # Create a connection to the SQLite database
    conn = sqlite3.connect(db_path)

    # Read the CSV into a DataFrame
    df = pd.read_csv(csv_path)

    # Add a unique ID column. The ID will start from 1 to the length of the dataframe.
    df.insert(0, 'id', range(1, 1 + len(df)))

    # Write the DataFrame to the SQLite database
    df.to_sql(table_name, conn, if_exists='replace', index=False)

    # Commit changes and close the connection
    conn.commit()
    conn.close()

    print(f"CSV data from {csv_path} has been written to {db_path} in table {table_name}.")

# Usage
csv_path = "NHwords.csv"
db_path = "nhwords.db"
table_name = "nhwords"

csv_to_sqlite(csv_path, db_path, table_name)
