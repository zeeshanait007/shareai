const YF = require('yahoo-finance2').default;
const yahooFinance = new YF();

async function testSearch(query) {
    try {
        const result = await yahooFinance.search(query, {}, { validateResult: false });
        console.log(`Results for "${query}":`);
        result.quotes.forEach(q => {
            console.log(`- ${q.symbol} (${q.shortname}): typeDisp=${q.typeDisp}, quoteType=${q.quoteType}`);
        });
    } catch (e) {
        if (e.name === 'FailedYahooValidationError') {
            console.log(`Validation failed for "${query}", but data might be available in e.result:`);
            if (e.result && e.result.quotes) {
                e.result.quotes.forEach(q => {
                    console.log(`- ${q.symbol} (${q.shortname}): typeDisp=${q.typeDisp}, quoteType=${q.quoteType}`);
                });
            }
        } else {
            console.error(e);
        }
    }
}

const query = process.argv[2] || 'AAPL';
testSearch(query);
