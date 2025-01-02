exports.fetchCompanyInfo = async (companyName) => {
    try {
        const response = await axios.get(`https://company.clearbit.com/v2/companies/find?name=${companyName}`, {
            headers: { 'Authorization': `Bearer YOUR_CLEARBIT_API_KEY` }
        });

        return {
            logo: response.data.logo,
            name: response.data.name,
            description: response.data.description,
            website: response.data.domain,   // This is the company website
            sector: response.data.category,
            industry: response.data.category.industry,
            location: response.data.location,
            employees: response.data.employees,
            foundingYear: response.data.founded,
            companyType: response.data.type,
            marketCap: "Not Available", // Example: Clearbit might not provide market cap
            revenue: "Not Available",   // Clearbit doesn't provide revenue info
            tagline: response.data.tagline,
            stockTicker: response.data.ticker,
            specialties: response.data.specialties || []
        };
    } catch (error) {
        throw new Error("Failed to fetch company info");
    }
};

// Function to fetch competitor data from SimilarWeb API
exports.fetchCompetitors = async (companyName) => {
    try {
        const response = await axios.get(`https://api.similarweb.com/v1/competitors/${companyName}?api_key=YOUR_SIMILARWEB_API_KEY`);
        
        // Return competitor information
        return response.data.competitors.map(comp => ({
            name: comp.name,
            description: comp.description,
            primaryDifference: comp.difference,
            website: comp.website
        }));
    } catch (error) {
        throw new Error("Failed to fetch competitors");
    }
};

// Function to fetch competitor statistics using Bright Data API
exports.fetchCompetitorStatistics = async (companyWebsite) => {
    try {
        // Replace this with an actual Bright Data API call to fetch competitor statistics like Glassdoor, Web Traffic, etc.
        const response = await axios.get(`https://api.brightdata.com/v1/competitor_statistics/${companyWebsite}?api_key=YOUR_BRIGHTDATA_API_KEY`);

        return {
            glassdoor: response.data.glassdoor || "Not Available",
            headcount: response.data.headcount || "Not Available",
            webTraffic: response.data.webTraffic || "Not Available",
            linkedin: response.data.linkedin || "Not Available",
            twitter: response.data.twitter || "Not Available"
        };
    } catch (error) {
        throw new Error("Failed to fetch competitor statistics");
    }
};
exports.getCompanyData = async (req, res) => {
    const { companyName } = req.body;

    if (!companyName) {
        return res.status(400).json({ message: "Company name is required" });
    }

    try {
        const companyInfo = await fetchCompanyInfo(companyName); // Fetch company info
        const competitors = await fetchCompetitors(companyName); // Fetch competitors

        // Fetch competitor statistics concurrently
        const competitorStats = await Promise.all(
            competitors.map(async (competitor) => {
                const stats = await fetchCompetitorStatistics(competitor.website); // Fetch stats for each competitor
                return { ...competitor, stats }; // Combine competitor info with their stats
            })
        );

        res.status(200).json({ companyInfo, competitors: competitorStats }); // Send back company info and competitors' stats
    } catch (error) {
        res.status(500).json({ message: "Error fetching company data", error }); // Error handling
    }
};
