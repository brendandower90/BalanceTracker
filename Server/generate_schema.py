import os, argparse, traceback
import requests, json

DEBUG = True
MAX_COINS = 250

def get_coingecko_ranking(limit=250):
    api_url = 'https://api.coingecko.com/api/v3/coins/markets'
    params = {
        'vs_currency': 'usd',
        'order': 'market_cap_desc',
        'per_page': limit,
        'page': 1,
        'sparkline': False,
        'locale': 'en'
    }
    response = requests.get(api_url, params=params)
    data = response.json()
    return [{"rank": coin["market_cap_rank"], "id": coin["id"]} for coin in data]

def get_coingecko_schema():
    api_url = 'https://api.coingecko.com/api/v3/coins/list'
    headers = {'Accept': 'application/json'}
    params = {'include_platform':'true'}
    response = requests.get(api_url, headers=headers, params=params)
    data = response.json()
    return {"Coins":data}


def sort_and_slice_schema(schema, num_coins):
    sorted_schema = sorted(schema, key=lambda x: x['rank'])
    return sorted_schema[:num_coins]


def filter_and_rank_schema(coingecko_schema, top_coins_ranking):
    top_coins_ids = set(coin['id'] for coin in top_coins_ranking)
    filtered_schema = [coin for coin in coingecko_schema['Coins'] if coin['id'] in top_coins_ids]
    
    # Add the rank to each coin in the schema
    for coin in filtered_schema:
        coin['rank'] = next(item['rank'] for item in top_coins_ranking if item['id'] == coin['id'])
    return filtered_schema


def does_schema_exist(filename):
    return os.path.isfile(filename)


def save_to_json(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)  # `indent=4` for pretty printing


def main(num_of_coins, update):
    schema_filepath = "Server/schemas/"
    schema_max_filename = f'{schema_filepath}coinSchema{MAX_COINS}.json'
    schema_filename = f'{schema_filepath}coinSchema{num_of_coins}.json'
    schema_max_exists = does_schema_exist(schema_max_filename)

    common_coin_list_sizes = [10, 20, 50, 100, 150, 200]

    if not schema_max_exists or update:
        #Get Schema and ranking from Coingecko
        coingecko_schema = get_coingecko_schema()
        coingecko_ranks = get_coingecko_ranking()

        ranked_schema = filter_and_rank_schema(coingecko_schema, coingecko_ranks)
        ranked_schema = sort_and_slice_schema(ranked_schema, MAX_COINS)

        save_to_json(ranked_schema, schema_max_filename)

        for list_size in common_coin_list_sizes:
            filename = f'{schema_filepath}coinSchema{list_size}.json'
            if not does_schema_exist(filename):
                schema = sort_and_slice_schema(ranked_schema, list_size)
                save_to_json(schema, filename)

    if num_of_coins != 250:
        with open(schema_max_filename, 'r') as file:
            full_schema = json.load(file)
            ranked_schema = sort_and_slice_schema(full_schema, num_of_coins)
            save_to_json(ranked_schema, schema_filename)


def parseArgs():
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--num_of_coins', type=int, default=MAX_COINS, help='Number of coins to include in the schema.')
    parser.add_argument('--update', default=False, action='store_true', help='Update the coin schema')
    return parser.parse_args()


if __name__ == "__main__":
    try:
        args = parseArgs()
        main(args.num_of_coins, args.update)
    except KeyboardInterrupt:
        exit(0)
    except Exception as e:
        print("Error! ", e)
        if DEBUG:
            traceback.print_exc()  # This will print the detailed traceback