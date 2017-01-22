# Chrome Keyword Querier 

## Description 

In this project, I have created a Chrome extension which lets you query several websites over an interval to check for changes in specified keywords. It has (so-far) been written entirely in Javascript, CSS and HTML. The necessity for such an application arose during boxing day season, when I was shopping for deals, constantly checking retailers for the monitor I wanted. Instead of anxiously refreshing webpages every minute, I figured I could have a program do the job for me. Later, I realized the usefulness for the extension stretched further than first envisioned, since I can use it as a proto-notification system by checking disparities in frequency of appearance of given keywords in the target website's HTML from one request interval to another. For instance, not only can I use it for checking deals online, but I can also inspect changes in RSS feeds, see if new lecture recordings were uploaded, check if I the file I was searching for is finally available for download, etc. To get around the same-origin policy, I am using a proxy called "[CORS Anywhere](https://cors-anywhere.herokuapp.com/)" which, as the name betrays, enforces CORS headers on cross-origin websites. The project is still under development.         

## To-do:

1. Add interval error check (do tests to see minimal limit of XMLRequest)
2. Some sort of pop-up below the tabs for better error display 
3. Keywords get added up as different "bubbles" instead of separated by commas 
4. Make a "fancier"" notification popup
5. Save results to external txt file 

## Screenshots

!(https://i.imgur.com/aBnDqEU.png)[screenshot1]
!(https://i.imgur.com/8ukfNty.png)[screenshot2]
!(https://i.imgur.com/dUiGeT2.png)[screenshot3]
