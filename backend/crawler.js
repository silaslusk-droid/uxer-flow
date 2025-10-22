const { fetch } = require('undici');
const cheerio = require('cheerio');
const { URL } = require('url');

// Utility function to normalize URLs
function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        // Convert hostname to lowercase
        parsed.hostname = parsed.hostname.toLowerCase();
        // Remove trailing slash unless it's the root
        if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }
        // Remove hash fragments
        parsed.hash = '';
        return parsed.toString();
    } catch (error) {
        return null;
    }
}

// Check if URL has binary file extension
function isBinaryUrl(url) {
    const binaryExtensions = /\.(jpg|jpeg|png|gif|pdf|css|js|ico|svg|woff|woff2|ttf|eot)$/i;
    return binaryExtensions.test(url);
}

// Main crawler function
async function crawl({ startUrl, maxPages = 200, maxDepth = 3 }) {
    const seen = new Set();
    const queue = [{ url: normalizeUrl(startUrl), depth: 0 }];
    const nodes = [];
    const edges = [];
    const baseUrl = new URL(startUrl);

    console.log(`Starting crawl from ${startUrl} (max ${maxPages} pages, depth ${maxDepth})`);

    while (queue.length > 0 && nodes.length < maxPages) {
        const { url, depth } = queue.shift();
        
        if (seen.has(url) || depth > maxDepth || isBinaryUrl(url)) continue;
        seen.add(url);

        try {
            console.log(`Crawling ${url} (depth ${depth})`);
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);

            // Create node for current page
            const title = $('title').text().trim() || new URL(url).pathname;
            const nodeId = nodes.length;
            nodes.push({
                title,
                url,
                meta: { depth }
            });

            // Extract and process links
            $('a[href]').each((_, element) => {
                try {
                    const href = $(element).attr('href');
                    const resolvedUrl = new URL(href, url);
                    const normalizedUrl = normalizeUrl(resolvedUrl.toString());

                    // Only process URLs from same origin
                    if (normalizedUrl && 
                        resolvedUrl.origin === baseUrl.origin && 
                        !isBinaryUrl(normalizedUrl)) {
                        
                        if (!seen.has(normalizedUrl)) {
                            queue.push({ 
                                url: normalizedUrl, 
                                depth: depth + 1 
                            });
                        }

                        // Record edge to this URL if we've seen it before
                        const targetIndex = nodes.findIndex(n => n.url === normalizedUrl);
                        if (targetIndex !== -1) {
                            edges.push({
                                source: nodeId,
                                target: targetIndex,
                                type: 'link'
                            });
                        }
                    }
                } catch (err) {
                    // Skip invalid URLs
                }
            });

        } catch (error) {
            console.error(`Error crawling ${url}:`, error.message);
        }
    }

    return {
        nodes,
        edges,
        stats: {
            pages: nodes.length,
            links: edges.length,
            crawled: seen.size
        }
    };
}

module.exports = { crawl, normalizeUrl };