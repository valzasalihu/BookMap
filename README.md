BookMap
BookMap is an interactive web application for discovering books by genre, mood, or latest releases. It includes an interactive book viewer with text reading, video/audio previews.


Main Features
Fully responsive and mobile-friendly design (hamburger menu, side drawer)
Book discovery by mood, genre, and recommendations
Interactive book viewer with:
Full text reading (.txt files)
Local video trailers with subtitles (.vtt)
Audio previews
YouTube trailer embedding

Advanced contact form enhanced with React (controlled components)
Google Books API integration for dynamic data
Local storage for recently viewed books
Full HTML5 semantics and accessibility support

Technologies Used
HTML5, CSS3 (Flexbox, Grid, CSS Variables)
Vanilla JavaScript (ES6+)
React 18 (used only for the enhanced contact form)
Google Books API
Font Awesome & Google Fonts

Project Structure
text/
├── css/              # All stylesheets
├── js/               # JavaScript files + React
├── images/           # Logo, backgrounds, mood/genre images
├── images/media/     # Book texts, videos, audio, captions
├── index.html
├── genre.html
├── mood.html
├── latest_releases.html
├── contact.html
└── README.md
How to Run Locally

Download or clone the project
Open index.html directly in your browser
Internet connection needed for Google Books API and external CDNs

Live Demo
https://bookmap.pages.dev/