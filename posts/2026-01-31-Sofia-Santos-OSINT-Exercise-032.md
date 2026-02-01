
# OSINT Exercise 032

**Briefing**:

Airports are global hubs where cultures, languages, and lives briefly intersect. Millions of people pass through them each day. On an undisclosed date and at an unknown location, one of these travellers recorded a TV screen for 28 seconds. The video can be found below.

**Your task is to:**  
a) Determine the exact date and time when the video was recorded.  
	Sep 1, 2024 - 9:14 pm ??
b) Identify the airport and the terminal where the TV screen was located.  

**Exercise level:**  
For beginners: a) Medium, b) Hard.  
For experts: a) Easy, b) Medium.

## Solution
### Find date and time

First of all, a review on the YouTube video, and it retrieves some elements, like a TV showing:

- Channel news with the logo **TV9** and some Hindi text
- an hour **9:14pm**
- news titles

With a Google reverse search (image) for the channel logo, it results in the **TV9 Bharatvarsh** channel.

![news-logo](https://github.com/user-attachments/assets/477de761-b6c3-41d5-873b-056df0a3072c)


Now let's search for some of the news on the TV using the title banners:
![f16-reverse](https://github.com/user-attachments/assets/92fc7a95-746b-46f3-a03f-a6a860e2cead)

![F16-banner](https://github.com/user-attachments/assets/722045dd-1586-4328-91da-444916d69bdb)



**English translation by Google:** Is Ukraine itself the reason for the F-16's 'burial'?

It returns a match with an [X post]([https://x.com/TV9Bharatvarsh/status/1830287997146943555](https://x.com/TV9Bharatvarsh/status/1830287997146943555)); it's from the **TV9 Bharatvarsh** X account, it has a very similar translation from Hindi to English (to validate that it is the same news), and it contains a date:

- **Sep 1, 2024**
![x-post-f16](https://github.com/user-attachments/assets/ae77b6bc-ec45-422c-86cc-59f0e0b532ab)



Now, to reinforce this date theory, a new search with another title of breaking news: it is on the YouTube video and in the X post.

![INDL-new](https://github.com/user-attachments/assets/6c6c561d-6fe2-4bd6-8408-7141f0bf0979)


**English translation by Google:** Haryana: Tayyab Hussain is the INLD candidate from Hathin.

It's possible to find an [article from the Indian Express]([https://indianexpress.com/article/cities/chandigarh/haryana-assembly-polls-inld-candidates-abhay-chautala-son-9545033/](https://indianexpress.com/article/cities/chandigarh/haryana-assembly-polls-inld-candidates-abhay-chautala-son-9545033/)) about the same news, also showing the same date of the X post:

- Sep 1, 2024
![INDL-other-new](https://github.com/user-attachments/assets/4168d2aa-11a3-4311-9e9f-5e3783f4bd71)


Now with the cross comparison between the two news pages that share the same date, it's possible to deduce that the date is **Sep 1, 2024.**
### Find Terminal

![[video.jpg]]

With the video, it is possible to see:
- Windows with some light reflection
- Shape of the TV with a metal frame
- Cell style with lamps 
- Glass panel at the bottom of the image

Now knowing this is in India, it's possible to search with an image-reversing search, adding Indian airports to filter the results.
![windows](https://github.com/user-attachments/assets/7ad8e7cc-5c76-42bd-85ac-daa8aefb24a3)



It returns a result from [trip.com]([https://www.trip.com/moments/detail/new-delhi-579-16340157/](https://www.trip.com/moments/detail/new-delhi-579-16340157/)) that mentions **Terminal 3 IGI Airport**. In the image, it's possible to see very similar windows to those shown in the video, specifically the white window frames; they have the same shape.

**Cut from the Youtube video**
![frames](https://github.com/user-attachments/assets/eddf8a8c-3558-47b8-b95c-f4a73f8ce811)


Using **Terminal 3 IGI Airport** as input for the search, YouTube returned this [video]([https://www.youtube.com/watch?v=fkRypk996vY](https://www.youtube.com/watch?v=fkRypk996vY)), which is about a tour in Terminal 3. It shows some elements of the building very similar to the video of the challenge; in some parts of the video, it shows some TVs with the same shape.

![tvs](https://github.com/user-attachments/assets/71b39457-7af8-4975-ad3c-729e7ea7586a)

<img width="3240" height="1080" alt="TV’s with same shape" src="https://github.com/user-attachments/assets/5cd3cf90-78b4-41de-8b99-4abf4acf2db4" />

Searching for the other terminals can show that they are very different from the elements mentioned above; this is a Google Maps image of the airport terminal.

<img width="2480" height="2480" alt="map" src="https://github.com/user-attachments/assets/679e5f16-eb80-4ab1-a238-d8e98cb97ab9" />

## Results

**a) Determine the exact date and time when the video was recorded.**  
	- Sep 1, 2024 - 9:14 pm 
**b) Identify the airport and the terminal where the TV screen was located.**  
	- Delhi IGI Airport Terminal 3
