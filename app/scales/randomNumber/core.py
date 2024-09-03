import json
import random
import time
import sys

def generate_random_numbers():
    while True:
        # Generate five random numbers
        random_numbers = [random.randint(0, 100) for _ in range(5)]

        # Write to JSON file
        with open("numbers.json", 'w') as file:
            json.dump({"numbers": random_numbers}, file)

        time.sleep(1)

if __name__ == "__main__":
    print("yeah")
    generate_random_numbers()
