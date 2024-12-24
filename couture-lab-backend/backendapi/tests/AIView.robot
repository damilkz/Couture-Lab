*** Settings ***

Library    SeleniumLibrary
Library    RequestsLibrary
Library    json

*** Variables ***

*** Test Cases ***

Site Navigation
    Open Browser    https://couture-lab-backend.web.app/    chrome
    Maximize Browser Window

    # Navigate to the sign-in page
    Click Element    xpath=//*[@id="root"]/div[2]/nav/a[2]

    # Sign-in
    Input Text    css:input[placeholder="E.u. hello"]    dxiong372@gmail.com
    Input Password    css:input[placeholder="Enter Your Password"]    davidhi
    Click Element    xpath=//*[@id="root"]/div[2]/div/div[2]/div[2]/form/input[3]

    # Open the styling assistant
    Wait Until Element Is Visible    xpath=//*[@id="root"]/main/div[1]/button
    Click Element    xpath=//*[@id="root"]/main/div[1]/button

    # Testing a query
    Wait Until Element Is Visible    css:input[placeholder="Chat with Your Styling Assistant"]
    Input Text    css:input[placeholder="Chat with Your Styling Assistant"]    Give me an outfit to wear in the summer
    Press Key    css:input[placeholder="Chat with Your Styling Assistant"]    \\13
    Wait Until Page Contains Element    xpath=//*[@id="root"]/main/div[1]/aside/div/div/div[1]/p[2]    30  
    Close Browser

Simple Query (NO API CALLS)
    ${response}    GET    http://localhost:8000/langserve/

    Should Be Equal    ${response.text}    "test"

    &{questionnaire}    Create Dictionary    
    ...    Age group=18 to 25    Body type=Hourglass    Budget=Medium    Experiment level=Very Comfortable
    ...    Eye color=Brown    Frequent events=Work    Gender=Female    Hair color=Brown    Preferred style=Casual
    ...    Skin tone=Fair    Sustainability=Not Important    name=Olivia

    &{body}    Create Dictionary    text=Give me an affordable fall outfit
    ...    questionnaire=&{questionnaire}    personalize=1    
    ...    imageFlag=${False}
    ${stringified_body}    Evaluate     json.dumps(&{body})    json
    &{headers}    Create Dictionary    Content-Type    application/json
    ${response}    POST    http://localhost:8000/langserve/
    ...    ${stringified_body}
    ...    headers=&{headers}

    

*** Keywords ***