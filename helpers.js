const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');

// Example target array
const targetArray = [
    'Politics',
    'Sport',
    'Entertainment',
    'Environment',
    'Development',
    'Business',
    'News',
    'Technology',
    'International',
    'Features',
    'Blogs Feed'
];

function htmlToString(htmlString) {
    // Load the HTML string into a Cheerio object
    const $ = cheerio.load(htmlString);
    
    // Get all paragraphs except the first one if it contains an anchor tag and any empty paragraphs
    let paragraphs = $('p').filter((index, element) => {
        if (index === 0 && $(element).find('a').length > 0) {
            return false; // Ignore the first paragraph with anchor tag
        }
        return $(element).text().trim().length > 0; // Ignore empty paragraphs
    });

    // Get the text content without HTML tags for non-empty paragraphs
    let content = '';
    paragraphs.each((index, element) => {
        content += $(element).text() + ' ';
    });

    return content
}

const makeSlug = (str) => {
    // Remove white spaces and replace with dash
    const slug = str.replace(/\s+/g, '-');

    // Remove special symbols using regex
    const cleanSlug = slug.replace(/[^\w\s-]/g, '');

    // Convert to lowercase
    const formattedSlug = cleanSlug.toLowerCase();

    return formattedSlug;
}

function filterNicenameValues(obj, targetArray) {
    // Check if the object has a "$" key and a "nicename" key in "$"
    if (obj["$"] && obj["$"].nicename) {
        // Extract the value of "nicename" from the object and capitalize the first letter
        const nicenameValue = obj["$"].nicename.charAt(0).toUpperCase() + obj["$"].nicename.slice(1);

        // Initialize an empty array to store matching values
        let resultArray = [];

        // Check if the capitalized nicename value is found in targetArray
        if (targetArray.includes(nicenameValue)) {
            resultArray.push(nicenameValue);
        }

        // If resultArray is empty, add "News"
        if (resultArray.length === 0) {
            resultArray.push("News");
        }

        // Return the resulting array
        return resultArray;
    } else {
        // Return ["News"] if conditions are not met
        return ["News"];
    }
}

function cleanWordPressContent(content) {
    // Remove all WordPress annotations <!-- ... -->
    const cleanedContent = content.replace(/<!--[\s\S]*?-->/g, '');
    return sanitizeHtml(cleanedContent, {
        allowedTags: [
            'p', 
            'strong', 
            'em', 
            'a', 
            "blockquote", 
            "h1", 
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
        ], // Add more allowed tags as needed
        allowedAttributes: { a: ['href'] }, // Allow href attribute for <a> tags
    });
}

// Sample arrays
  // Function to add image URLs to firstArray based on IDs
const addImagesToArticleArray = (firstArray, secondArray) => {
    // Iterate through firstArray
    firstArray.forEach(obj1 => {
      // Find the corresponding object in secondArray based on ID
      const matchingObj = secondArray.find(obj2 => obj2["wp:post_parent"][0] === obj1["wp:post_id"][0]);
      // If a matching object is found, add the URL to obj1
      if (matchingObj) {
        obj1['wp:attachment_url'] = matchingObj['wp:attachment_url'];
      }
    });

    return firstArray
}

const helpers = {
    targetArray,
    htmlToString,
    makeSlug,
    filterNicenameValues,
    cleanWordPressContent,
    addImagesToArticleArray,
}

module.exports= helpers;