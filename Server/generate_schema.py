import os, argparse, traceback
import requests, json

DEBUG = True

def get_coingecko_schema():
    api_url = 'https://api.coingecko.com/api/v3/coins/list'
    headers = {'Accept': 'application/json'}
    params = {'include_platform':'true'}
    response = requests.get(api_url, headers=headers, params=params)
    data = response.json()
    return {"Coins":data}

def does_schema_exist(filename):
    return os.path.isfile(filename)

def save_to_json(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)  # `indent=4` for pretty printing


def main(update):
    schema_filepath = "Server/schemas/"
    schema_filename = f'{schema_filepath}coinSchemaAll.json'
    schemaExists = does_schema_exist(schema_filename)

    if not schemaExists or update:
        #Get Schema from Coingecko
        coingecko_schema = get_coingecko_schema()

        save_to_json(coingecko_schema, schema_filename)



if __name__ == "__main__":
    try:
        main(True)
    except KeyboardInterrupt:
        exit(0)
    except Exception as e:
        print("Error! ", e)
        if DEBUG:
            traceback.print_exc()  # This will print the detailed traceback