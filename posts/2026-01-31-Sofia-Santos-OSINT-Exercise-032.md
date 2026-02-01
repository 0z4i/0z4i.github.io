
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

![[news-logo.jpg]]

Now let's search for some of the news on the TV using the title banners:

![[f16-reverse.jpg]]

![[F16-banner.jpg]]

**English translation by Google:** Is Ukraine itself the reason for the F-16's 'burial'?

It returns a match with an [X post]([https://x.com/TV9Bharatvarsh/status/1830287997146943555](https://x.com/TV9Bharatvarsh/status/1830287997146943555)); it's from the **TV9 Bharatvarsh** X account, it has a very similar translation from Hindi to English (to validate that it is the same news), and it contains a date:

- **Sep 1, 2024**

![[x-post-f16.jpg]]

Now, to reinforce this date theory, a new search with another title of breaking news: it is on the YouTube video and in the X post.

![[INDL-new.jpg]]

**English translation by Google:** Haryana: Tayyab Hussain is the INLD candidate from Hathin.

It's possible to find an [article from the Indian Express]([https://indianexpress.com/article/cities/chandigarh/haryana-assembly-polls-inld-candidates-abhay-chautala-son-9545033/](https://indianexpress.com/article/cities/chandigarh/haryana-assembly-polls-inld-candidates-abhay-chautala-son-9545033/)) about the same news, also showing the same date of the X post:

- Sep 1, 2024

![[INDL-other-new.jpg]]

Now with the cross comparison between the two news pages that share the same date, it's possible to deduce that the date is **Sep 1, 2024.**
### Find Terminal

![[video.jpg]]

With the video, it is possible to see:
- Windows with some light reflection
- Shape of the TV with a metal frame
- Cell style with lamps 
- Glass panel at the bottom of the image

Now knowing this is in India, it's possible to search with an image-reversing search, adding Indian airports to filter the results.

![[windows.jpg]]

It returns a result from [trip.com]([https://www.trip.com/moments/detail/new-delhi-579-16340157/](https://www.trip.com/moments/detail/new-delhi-579-16340157/)) that mentions **Terminal 3 IGI Airport**. In the image, it's possible to see very similar windows to those shown in the video, specifically the white window frames; they have the same shape.

**Cut from the Youtube video**
![[frames.jpg]]

Using **Terminal 3 IGI Airport** as input for the search, YouTube returned this [video]([https://www.youtube.com/watch?v=fkRypk996vY](https://www.youtube.com/watch?v=fkRypk996vY)), which is about a tour in Terminal 3. It shows some elements of the building very similar to the video of the challenge; in some parts of the video, it shows some TVs with the same shape.

![[tvs.jpg]]

![[TV’s with same shape.png]]

Searching for the other terminals can show that they are very different from the elements mentioned above; this is a Google Maps image of the airport terminal.

![[map.png]]

## Results

**a) Determine the exact date and time when the video was recorded.**  
	- Sep 1, 2024 - 9:14 pm 
**b) Identify the airport and the terminal where the TV screen was located.**  
	- Delhi IGI Airport Terminal 3