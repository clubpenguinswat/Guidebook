# Guidebook
This is a guidebook exclusive to the SWAT Corporation.
https://clubpenguinswat.github.io/Guidebook/

## Privacy
Please do not share the link to the guidebook publicly, and ensure it is limited to the members of the SWAT Corporation. The website is password-protected, but can password protection can be bypassed. We do not encourage sharing the link to the GitHub repository publicly either.

## Content Guidelines
- Please do not add or show inappropriate content or examples.
- Please use formal American English throughout the content.
- Add definitions using the `<dfn>` HTML tag where fit.
  - Do not add definitions in locations where the definition is being explained.
  - Ensure your definition is added onto the `definitions.json` file.
    - All definitions in the JSON file must be ordered alphabetically.
    - When writing the definition in the JSON file, write the phrase you are defining in lowercase.
    - Set the thumbnail to `null` to use the nullified thumbnail for the infobox.
    - If a thumbnail is set and is not `null`, the image path must be relative to the `thumbnails` directory itself. Therefore, you would write `logo.png` in the JSON file to point to `thumbnails/logo.png`.
    - The description should not be very long, and should fit without the need of showing a scrollbar, ideally.
  - Do not use definitions to explain vocabulary from the English language, unrelated to Club Penguin, Club Penguin armies, or SWAT.
- Add internal links in articles using the `<a>` tag.
  - Make sure to begin the `href` attribute of the tag with a `#` for it to correctly render the internal link.
- Add external links in articles using the `<a>` tag. If the `href` attribute begins with `http:` or `https:`, the client will consider it as an external link and automatically add `target="_blank"` for you. Do not add a `target` attribute unless you have to override this setting.
- Use headings synchronously and in order. The top-level heading is defined by the `<h1>` tag, and the lowest-level heading is defined by the `<h6>` tag.
- Add anchors to headings by adding the `id` attribute to them.
  - An anchor must be inserted in the format: `Article_Link:Heading_Query`.
- Use textblocks (`<div class="textblock">`) when writing text examples or blocks of text which can be copied to clipboard.
- Any scripts unique to an article should be included in the `<script>` tag within the article. Similarly, any CSS unique to an article should be included in the `<style>` tag within the article.
  - Note that code included in the `<script>` and `<style>` tags apply globally, in the entire guidebook client, for as long as the article is being viewed.
- Each page should have a proper filename, which is the same as the page name. Except, spaces should be replaced with `_`, and symbols should be avoided.
- You can show content depending on their device. To achieve this, you can use the `mobileOnly` and `pcOnly` classes.
  - Apply the `mobileOnly` class on an element you wish to display only on mobile.
  - Apply the `pcOnly` class on an element you wish to display on non-mobile devices.
  - This feature is useful to develop web-responsive features, or to show content depending on the user's device.