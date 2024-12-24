from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import AISerializer
from dotenv import load_dotenv
from openai import OpenAI
from django.http import StreamingHttpResponse
from random import sample

import json
import asyncio
import aiohttp
import os

# Countries supported by the product fetch API
valid_countries = ["US", "AU", "BR", "CA", "CN", "FR", "DE", "IN", "IT", "MX", 
"NL", "SG", "ES", "TR", "AE", "GB", "JP", "SA", "PL", "SE", "BE", "EG"]

# Fetch country code of user
async def get_country_code(session):
    url = "https://ip-geo-location.p.rapidapi.com/ip/check"

    querystring = {"format":"json"}

    headers = {
    	"X-RapidAPI-Key": rapid_key,
    	"X-RapidAPI-Host": "ip-geo-location.p.rapidapi.com"
    }

    async with session.get(url, params=querystring, headers=headers) as response:
        if response.status == 200:
            country_dict = await response.json()

            country = country_dict["country"]["code"]

            return country

        return f"Error: Unable to fetch country data. Status code: {response.status}"

# Fetch local (to user) weather data
async def get_local_weather(session):
    url = "https://ip-geo-location.p.rapidapi.com/ip/check"

    querystring = {"format":"json"}

    headers = {
        "X-RapidAPI-Key": rapid_key,
        "X-RapidAPI-Host": "ip-geo-location.p.rapidapi.com"
    }

    async with session.get(url, params=querystring, headers=headers) as response:
        if response.status == 200:
            geolocation_dict = await response.json()

            latitude, longitude = geolocation_dict["location"]["latitude"], geolocation_dict["location"]["longitude"]

            url = "https://weatherapi-com.p.rapidapi.com/current.json"

            querystring = {"q":f"{latitude},{longitude}"}

            headers = {
                "X-RapidAPI-Key": rapid_key,
                "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com"
            }

            async with session.get(url, params=querystring, headers=headers) as response:
                if response.status == 200:
                    response = await response.json()

                    wind_speed_in_kilometers_per_hour, precipitation_in_inches, temperature_in_celsius = response["current"]["wind_kph"], response["current"]["precip_in"], response["current"]["temp_c"]

                    weather_dict = {"wind_speed_in_kilometers_per_hour": wind_speed_in_kilometers_per_hour, 
                    "precipitation_in_inches": precipitation_in_inches,
                    "temperature_in_celsius": temperature_in_celsius}

                    return json.dumps(weather_dict)

                return f"Error: Unable to fetch local weather. Status code: {response.status}"

        return f"Error: Unable to fetch geolocation data. Status code: {response.status}"

# Fetch product search results for a single clothing item
async def get_clothing_item(
    item,
    session,
    gender=None,
    budget=None,
    country="US"
):
    url = "https://real-time-product-search.p.rapidapi.com/search"

    if gender != None:
        if gender == "Male":
            query = "men's {}".format(item)
            other_filters = "1020288|1020289"
        else:
            query = "women's {}".format(item)
            other_filters = "1020288|1020290"

        if budget == "Low":
            max_price = 50
        elif budget == "Medium":
            max_price = 200

        if (budget == "Low") or (budget == "Medium"):
            querystring = \
                {
                    "q": query,
                    "other_filters": other_filters,
                    "max_price": max_price,
                    "country": country
                }
        else:
            querystring = \
                {
                    "q": query,
                    "other_filters": other_filters,
                    "country": country
                }
    else:
        querystring = \
                {
                    "q": item,
                    "country": country
                }

    headers = {
        "X-RapidAPI-Key": rapid_key,
        "X-RapidAPI-Host": "real-time-product-search.p.rapidapi.com"
    }

    async with session.get(url, headers=headers, params=querystring) as response:
        if response.status == 200:
            product_dict = await response.json()

            product_recommendations = sample(product_dict['data'], 2)

            for product_index in range(len(product_recommendations)):
                del product_recommendations[product_index]["product_id"]
                del product_recommendations[product_index]["product_rating"]
                del product_recommendations[product_index]["typical_price_range"]
                del product_recommendations[product_index]["product_description"]
                del product_recommendations[product_index]["product_attributes"]
                del product_recommendations[product_index]["product_offers_page_url"]
                del product_recommendations[product_index]["product_specs_page_url"]
                del product_recommendations[product_index]["product_reviews_page_url"]
                del product_recommendations[product_index]["product_num_reviews"]
                del product_recommendations[product_index]["product_num_offers"]
                del product_recommendations[product_index]["offer"]

            return product_recommendations

        return f"Error: Unable to fetch clothing item data. Status code: {response.status}"

# Retrieves real-time product info for one or more clothing items
async def get_clothing_data(
    clothing_items,
    session,
    gender,
    budget,
    country="US"
    ):
        item_list = clothing_items.split(", ")

        product_promises, product_responses = [], []
        
        for item in item_list:
            product_promises.append(asyncio.ensure_future(get_clothing_item(
                item, session, gender, budget, country)))

        for promise in asyncio.as_completed(product_promises, timeout=60):
            response = await promise

            if type(response) == str:
                return f"Error: Unable to fetch clothing data."

            product_responses += response

        return json.dumps(product_responses, indent=2)

# Fetch weather data of a given location
async def get_weather_data(location, session):
    url = "https://ai-weather-by-meteosource.p.rapidapi.com/find_places"

    querystring = {"text":location,"language":"en"}

    headers = {
        "X-RapidAPI-Key": rapid_key,
        "X-RapidAPI-Host": "ai-weather-by-meteosource.p.rapidapi.com"
    }

    async with session.get(url, params=querystring, headers=headers) as response:
        if response.status == 200:
            location_dict = await response.json()

            if not len(location_dict):
                return "Error: Invalid location"

            location_id = location_dict[0]["place_id"]

            url = "https://ai-weather-by-meteosource.p.rapidapi.com/current"

            querystring = {"place_id": location_id,"timezone":"auto","language":"en","units":"metric"}

            headers = {
                "X-RapidAPI-Key": rapid_key,
                "X-RapidAPI-Host": "ai-weather-by-meteosource.p.rapidapi.com"
            }

            async with session.get(url, params=querystring, headers=headers) as response:

                if response.status == 200:
                    weather_dict = await response.json()

                    temperature_in_celsius, wind_chill, wind_speed_in_meters_per_second, precipitation_in_cm = weather_dict["current"]["temperature"], weather_dict["current"]["wind_chill"], weather_dict["current"]["wind"]["speed"], weather_dict["current"]["precipitation"]["total"]

                    response_dict = {"temperature_in_celsius": temperature_in_celsius, "wind_chill": 
                    wind_chill, "wind_speed_in_meters_per_second": wind_speed_in_meters_per_second, "precipitation_in_cm": precipitation_in_cm}

                    return json.dumps(response_dict)
                
                return f"Error: Unable to fetch weather data. Status code: {response.status}"
        
        return f"Error: Unable to fetch geolocation data. Status code: {response.status}"

# Asynchronous function for the styling assistant to process any function calls concurrently
async def process_functions(messages, tools, user_gender=None, user_budget=None):
    async with aiohttp.ClientSession() as session:
        for i in range(2):
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )

            function_name = None

            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            if tool_calls:
                available_functions = {
                    "get_clothing_data": get_clothing_data,
                    "get_local_weather": get_local_weather,
                    "get_weather_data": get_weather_data
                }
                messages.append(response_message)

                call_list, fetched_products = [], False

                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_to_call = available_functions[function_name]
                    function_args = json.loads(tool_call.function.arguments)

                    function_args["session"] = session

                    if function_name == "get_clothing_data":
                        fetched_products = True

                        function_args["gender"] = user_gender
                        function_args["budget"] = user_budget

                        user_country_code = await get_country_code(session)

                        if user_country_code in valid_countries:
                            function_args["country"] = user_country_code

                    call_list.append({"function_to_call": function_to_call, 
                    "function_name": function_name, "function_args": function_args,
                    "tool_call_id": tool_call.id})

                call_promises = []

                for call in call_list:
                    my_function = call["function_to_call"]
                    my_args = call["function_args"]

                    call_promises.append(my_function(**my_args))

                call_responses = await asyncio.gather(*call_promises)

                for response_index in range(len(call_responses)):
                    messages.append({
                        "tool_call_id": call_list[response_index]["tool_call_id"],
                        "role": "tool",
                        "name": call_list[response_index]["function_name"],
                        "content": call_responses[response_index]
                    })

                if fetched_products:
                    break

        return messages

# Generate response based on user query
def send_stylist_response(user_query, user_questionnaire, personalized_response, image_input):

    # Providing descriptions of all
    # available functions for the stylist to call
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_clothing_data",
                "description": "Get product data for one or more clothing items",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "clothing_items": {
                            "type": "string",
                            "description": "The name of an item, e.g. 't-shirt', or multiple, e.g. 't-shirt, jeans'"
                        }
                    },
                    "required": ["clothing_items"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_local_weather",
                "description": "Get local weather",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_weather_data",
                "description": "Get weather at a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The name of a location. Can be a city, e.g. New York City"
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]

    if personalized_response == '0':
        text_personalization_instructions, image_personalization_instructions = '', ''
    else:
        text_personalization_instructions = '''
        When determining items to call the function with, keep in mind the user is someone who has an implicit
        preferred style of {preferred_style}, a body type of {body_type}, is {experiment_level}
        with experimenting, has an eye color of {eye_color}, dresses most often for
        {frequent_events}, has a hair color of {hair_color}, has a {skin_tone} skin tone,
        and views sustainability as {sustainability} when it comes to shopping for clothes.
        '''.format(age = user_questionnaire['Age group'], 
        body_type = user_questionnaire['Body type'],
        experiment_level = user_questionnaire['Experiment level'],
        eye_color = user_questionnaire['Eye color'],
        frequent_events = user_questionnaire['Frequent events'],
        hair_color = user_questionnaire['Hair color'],
        preferred_style = user_questionnaire['Preferred style'],
        skin_tone = user_questionnaire['Skin tone'],
        sustainability = user_questionnaire['Sustainability'])

        image_personalization_instructions = '''
        When determining items for the outfit, keep in mind the user is someone who has an implicit
        preferred style of {preferred_style}, a body type of {body_type}, is {experiment_level}
        with experimenting, has an eye color of {eye_color}, dresses most often for
        {frequent_events}, has a hair color of {hair_color}, has a {skin_tone} skin tone,
        and views sustainability as {sustainability} when it comes to shopping for clothes.
        '''.format(age = user_questionnaire['Age group'], 
        body_type = user_questionnaire['Body type'],
        experiment_level = user_questionnaire['Experiment level'],
        eye_color = user_questionnaire['Eye color'],
        frequent_events = user_questionnaire['Frequent events'],
        hair_color = user_questionnaire['Hair color'],
        preferred_style = user_questionnaire['Preferred style'],
        skin_tone = user_questionnaire['Skin tone'],
        sustainability = user_questionnaire['Sustainability'])

    text_message = '''
    You are an expert fashion stylist. Draw on all your
    knowledge to provide concise and detailed answers to what users ask.

    When asked for an outfit, provide a complete color matching set of items, including tops,
    hats, bottoms, and accessories. Provide pictures for items. 

    Call the following functions in one go - do not expect follow-up opportunities:
    1. 'get_local_weather' whenever you need the weather of the user's local area.
    2. 'get_weather_data' whenever you need the weather of somewhere other than the user's
    local area.
    3. 'get_clothing_data' whenever making a specific style recommendation. {text_personalization_instructions}

    When citing specific examples using the provided functions, be sure to extract
    all items when there are multiple. Always extract product links and images.

    Only respond to fashion-related questions. You can only provide recommendations
    for fashion-related accessories or items.

    Address the user as "you".
    '''.format(text_personalization_instructions = text_personalization_instructions)


    image_message = '''
    You are an expert fashion stylist. Draw on all your knowledge to build a complete,
    color matching outfit that includes tops, hats, bottoms, and accessories, based
    off of the provided image of a clothing item. Your response should be NOTHING BUT A LIST
    of the recommended items, e.g. "White T-shirt, Blue Jeans, Red Hoodie". 
    
    {image_personalization_instructions}

    Only respond to fashion-related images. You can only provide recommendations
    for fashion-related accessories or items.

    Address the user as "you".
    '''.format(image_personalization_instructions = image_personalization_instructions)


    # Instructions for the stylist if input is text
    if not image_input:
        messages = [
            {"role": "system", "content": text_message},
            {"role": "user", "content": user_query}
        ]
    
     # If the input is an image
    else:
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": image_message},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": user_query
                        }
                    }
                ]
            }
        ]

    if not image_input:
        # Initial response that we can stream
        # a reply from if no function calls are required
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
            tool_choice="auto",
            stream=True
        )

        functions_required = False

        for chunk in response:
            if chunk.choices[0].delta.tool_calls is not None:
                functions_required = True
                break

            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    else:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=300
        )

        # Extract relevant features from the response
        features = response.choices[0].message.content

        functions_required = True

        text_message = '''
        You are an expert fashion stylist. Draw on all your
        knowledge to provide concise and detailed answers to what users ask.

        You have been provided a list of clothing items that comprise an outfit
        based off of an item the user initially supplied - provide recommendations
        for each item in the list.

        Call the following functions in one go - do not expect follow-up opportunities:
        1. 'get_local_weather' whenever you need the weather of the user's local area.
        2. 'get_weather_data' whenever you need the weather of somewhere other than the user's
        local area.
        3. 'get_clothing_data' whenever making a specific style recommendation. {text_personalization_instructions}

        When citing specific examples using the provided functions, be sure to extract
        all items when there are multiple. Always extract product links and images.

        Only respond to fashion-related questions. You can only provide recommendations
        for fashion-related accessories or items.

        Address the user as "you".
        '''.format(age = user_questionnaire['Age group'], 
        body_type = user_questionnaire['Body type'],
        experiment_level = user_questionnaire['Experiment level'],
        eye_color = user_questionnaire['Eye color'],
        frequent_events = user_questionnaire['Frequent events'],
        hair_color = user_questionnaire['Hair color'],
        preferred_style = user_questionnaire['Preferred style'],
        skin_tone = user_questionnaire['Skin tone'],
        sustainability = user_questionnaire['Sustainability'],
        text_personalization_instructions = text_personalization_instructions)

        messages = [
            {"role": "system", "content": text_message},
            {"role": "user", 
            "content": f"These are the items in the outfit: {features}"}
        ]

    # Alternatively, if functions are required...
    if functions_required:
        if personalized_response == '1':
            messages = asyncio.run(process_functions(
                messages, tools, user_questionnaire['Gender'], user_questionnaire['Budget']))
        else:
            messages = asyncio.run(process_functions(messages, tools))

        refined_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True
        )

        for chunk in refined_response:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content

class LangServeHandle(APIView):

    def get(self, request):
        return Response("test")

    def post(self, request):
        try:
            serializer = AISerializer(data = request.data)
            serializer.is_valid(raise_exception=True)
            query = serializer.validated_data['text']
            questionnaire = request.data['questionnaire']
            personalize = request.data['personalize']
            image_flag = request.data['imageFlag']

            return StreamingHttpResponse(
                send_stylist_response(query, questionnaire, personalize, image_flag), 
                    content_type="text/event-stream")

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Load OpenAI api key from .env file so everything works
load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
rapid_key = os.getenv("XRAPID_API_KEY")

client = OpenAI()