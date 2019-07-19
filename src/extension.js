/** 
 * AlbumArtTool by dragonman225
 * v0.1.0: Mar.21, 2019: Initial version.
 * v0.1.1: Mar.23, 2019: Add kkbox support. Refactor code.
 * v0.1.2: Apr.06, 2019: Improve doc.
 * v0.1.3: Jul.20, 2019: Add folder name generation to kkbox.
 */

var toolConfig = {
  injectElemIdPrefix: "album-art-tool-",
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
 * @returns {Object} The DOM object.
 */
function createLink(text) {
  var newDiv = document.createElement("div");
  var newLink = document.createElement("a");
  var newText = document.createTextNode("Full-res AlbumArt (." + text + ")");
  newLink.setAttribute("href", "");
  newLink.setAttribute("id", toolConfig.injectElemIdPrefix + text);
  newLink.appendChild(newText);
  newDiv.appendChild(newLink);
  return newDiv;
}

/**
 * Create a DOM object of an empty div component.
 * @param {string} name - ID without inject-prefix of the element.
 * @returns {Object} The DOM object.
 */
function createDiv(name) {
  var newDiv = document.createElement("input");
  newDiv.setAttribute("id", toolConfig.injectElemIdPrefix + name);
  newDiv.setAttribute("value", "Loading folder name...")
  newDiv.setAttribute("readonly", true)
  newDiv.setAttribute("style", "width: 100%;")
  return newDiv;
}

/**
 * Get domain from HTML <meta> tag with attribute "property" being "og:url".
 * @returns {string} The domain name if exists, otherwise an empty string.
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
 * @returns {urlList} URLs of JPG, PNG, BMP album art.
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
 * @returns {urlList} URLs of JPG, PNG, BMP album art.
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

function getFolderNameKkbox() {
  let album = $('.four-more-meta > h1').text()
  let artist = $('.creator-nick > a').text().trim().replace(' ','')
  let date = $('time').text().substring(0, 4)
  let folderName = `[Album]-${artist}-${album}(${date})`
  return folderName
}

/**
 * Update URLs of links.
 * @param {urlList} urls - An object containing JPG, PNG, BMP album art URLs.
 */
function updateAlbumArtUrl(urls) {
  var jpgLinkNode = document.getElementById(toolConfig.injectElemIdPrefix + "jpg");
  var pngLinkNode = document.getElementById(toolConfig.injectElemIdPrefix + "png");
  var bmpLinkNode = document.getElementById(toolConfig.injectElemIdPrefix + "bmp");
  jpgLinkNode.setAttribute("href", urls.jpg);
  pngLinkNode.setAttribute("href", urls.png);
  bmpLinkNode.setAttribute("href", urls.bmp);
}

function updateFolderName(str) {
  let folderNameNode = document.getElementById(toolConfig.injectElemIdPrefix + "folder");
  folderNameNode.setAttribute("value", str)
  folderNameNode.setAttribute("onClick", `
  this.select();
  document.execCommand('copy')`
  )
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
  let container = document.getElementsByClassName("container")[0];
  var metaArea = document.getElementsByClassName("four-more-meta")[0];
  var albumTitle = metaArea.getElementsByTagName("h1")[0];
  var linkJPG = createLink("jpg");
  var linkPNG = createLink("png");
  var linkBMP = createLink("bmp");
  let folderName = createDiv("folder");
  metaArea.insertBefore(linkJPG, albumTitle);
  metaArea.insertBefore(linkPNG, albumTitle);
  metaArea.insertBefore(linkBMP, albumTitle);
  container.insertBefore(folderName, container.children[1]);
}

/* Run on document ready */
$(document).ready(function () {

  /* Get current domain */
  var domain = getDomain();
  console.log("AlbumArtTool is running on " + domain);

  /* Execute domain-specific functions */
  if (domain === "music.apple.com") {
    initItunes();
    updateAlbumArtUrl(getArtUrlItunes());
  } else if (domain === "www.kkbox.com") {
    initKkbox();
    updateAlbumArtUrl(getArtUrlKkbox());
    updateFolderName(getFolderNameKkbox());
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
        updateFolderName(getFolderNameKkbox());
      }
      lastUpdate = Date.now();
      console.log("AlbumArtTool detected DOM changes, URLs were updated.");
    }
  });

});
