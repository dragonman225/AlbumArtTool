/** 
 * AlbumArtTool by dragonman225
 * v0.1.0: Mar.21, 2019: Initial version.
 * v0.1.1: Mar.23, 2019: Add kkbox support. Refactor code.
 */

var toolConfig = {
  htmlIdPrefix: "album-art-tool-",
  updateThrottleTime: 300
}

/**
 * An object to hold URLs of different image format.
 * @typedef {Object} urlList
 * @property {string} jpg - URL of JPG image.
 * @property {string} png - URL of PNG image.
 * @property {string} bmp - URL of BMP image.
 */

/**
 * Create a DOM object of an empty link component.
 * @param {string} text - Text to be shown in the link component.
 * @return {Object} The DOM object.
 */
function createLink(text) {
  var newDiv = document.createElement("div");
  var newLink = document.createElement("a");
  var newText = document.createTextNode("Full-res AlbumArt (." + text + ")");
  newLink.setAttribute("href", "");
  newLink.setAttribute("id", toolConfig.htmlIdPrefix + text);
  newLink.appendChild(newText);
  newDiv.appendChild(newLink);
  return newDiv;
}

/**
 * Get domain from HTML <meta> tag with attribute "property" being "og:url".
 * @return {string} The domain name if exists, otherwise an empty string.
 */
function getDomain() {
  var metaNodes = document.getElementsByTagName("meta");
  var domain = "";
  for (var i = 0; i < metaNodes.length; i += 1) {
    if (metaNodes[i].getAttribute("property") === "og:url") {
      var url = metaNodes[i].getAttribute("content");
      domain = url.split("/")[2];
      break;
    }
  }
  return domain;
}

/**
 * Get URLs of full-res JPG, PNG, BMP album art in iTunes.
 * @return {urlList} URLs of JPG, PNG, BMP album art.
 */
function getArtUrlItunes() {
  var artSourceNode = document.getElementsByClassName("we-artwork__source")[0];
  var artUrl = artSourceNode.getAttribute("srcset").split(",").pop().split(" ")[0];
  var artUrlMaxResJPG = artUrl.replace(/939x0w/, "99999x0w");
  var artUrlMaxResPNG = artUrlMaxResJPG.replace(/x0w.jpg/, "x0w.png");
  var artUrlMaxResBMP = artUrlMaxResJPG.replace(/x0w.jpg/, "x0w.bmp");
  return {
    jpg: artUrlMaxResJPG,
    png: artUrlMaxResPNG,
    bmp: artUrlMaxResBMP
  }
}

/**
 * Get URLs of full-res JPG, PNG, BMP album art in kkbox.
 * @return {urlList} URLs of JPG, PNG, BMP album art.
 */
function getArtUrlKkbox() {
  var metaArea = document.getElementsByClassName("four-more-meta")[0];
  var artSourceNode = metaArea.getElementsByTagName("img")[0];
  var artUrl = artSourceNode.getAttribute("src");
  var artUrlMaxResJPG = artUrl.replace(/500x500/, "2000x2000");
  var artUrlMaxResPNG = artUrlMaxResJPG.replace(/.jpg/, ".png");
  var artUrlMaxResBMP = artUrlMaxResJPG.replace(/.jpg/, ".bmp");
  return {
    jpg: artUrlMaxResJPG,
    png: artUrlMaxResPNG,
    bmp: artUrlMaxResBMP
  }
}

/**
 * Update URLs of links.
 * @param {urlList} urls - An object containing JPG, PNG, BMP album art URLs.
 */
function updateAlbumArtUrl(urls) {
  var jpgLinkNode = document.getElementById(toolConfig.htmlIdPrefix + "jpg");
  var pngLinkNode = document.getElementById(toolConfig.htmlIdPrefix + "png");
  var bmpLinkNode = document.getElementById(toolConfig.htmlIdPrefix + "bmp");
  jpgLinkNode.setAttribute("href", urls.jpg);
  pngLinkNode.setAttribute("href", urls.png);
  bmpLinkNode.setAttribute("href", urls.bmp);
}

/**
 * Init clickable links for iTunes
 */
function initItunes() {
  var artPicNode = document.getElementsByTagName("picture")[0];
  var linkJPG = createLink("jpg");
  var linkPNG = createLink("png");
  var linkBMP = createLink("bmp");
  artPicNode.appendChild(linkJPG);
  artPicNode.appendChild(linkPNG);
  artPicNode.appendChild(linkBMP);
}

/**
 * Init clickable links for kkbox
 */
function initKkbox() {
  var metaArea = document.getElementsByClassName("four-more-meta")[0];
  var albumTitle = metaArea.getElementsByTagName("h1")[0];
  var linkJPG = createLink("jpg");
  var linkPNG = createLink("png");
  var linkBMP = createLink("bmp");
  metaArea.insertBefore(linkJPG, albumTitle);
  metaArea.insertBefore(linkPNG, albumTitle);
  metaArea.insertBefore(linkBMP, albumTitle);
}

/* Run on document ready */
$(document).ready(function () {

  /* Get current domain */
  var domain = getDomain();
  console.log("AlbumArtTool is running on " + domain);

  /* Execute domain-specific functions */
  if (domain === "itunes.apple.com") {
    initItunes();
    updateAlbumArtUrl(getArtUrlItunes());
  } else if (domain === "www.kkbox.com") {
    initKkbox();
    updateAlbumArtUrl(getArtUrlKkbox());
  }

  var lastUpdate = Date.now();
  var throttleInterval = toolConfig.updateThrottleTime;

  /* Detect DOM changes and update URLs of links */
  $(document).bind('DOMSubtreeModified', function () {
    var timeElapsed = Date.now() - lastUpdate;

    /* Throttle the action to lower the load */
    if (timeElapsed > throttleInterval) {
      if (domain === "itunes.apple.com") {
        updateAlbumArtUrl(getArtUrlItunes());
      } else if (domain === "www.kkbox.com") {
        updateAlbumArtUrl(getArtUrlKkbox());
      }
      lastUpdate = Date.now();
      console.log("AlbumArtTool detected DOM changes, URLs were updated.");
    }
  });

});
