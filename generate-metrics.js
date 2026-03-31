const fs = require('fs');

async function generate() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Missing GITHUB_TOKEN environment variable");
    process.exit(1);
  }

  const username = "okyashgajjar";

  const query = `
    query {
      user(login: "${username}") {
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            stargazerCount
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  
  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    process.exit(1);
  }

  const user = data.data.user;
  const totalRepos = user.repositories.totalCount;
  const totalStars = user.repositories.nodes.reduce((acc, repo) => acc + repo.stargazerCount, 0);
  const totalCommits = user.contributionsCollection.contributionCalendar.totalContributions;

  // Generate a totally custom sleek SVG card!
  const svg = `
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    .bg { fill: #0d1117; stroke: #30363d; stroke-width: 2px; rx: 10px; }
    .text-title { font: 600 20px 'Segoe UI', Ubuntu, sans-serif; fill: #58a6ff; }
    .text-stat { font: 400 16px 'Segoe UI', Ubuntu, sans-serif; fill: #c9d1d9; }
    .text-value { font: 600 16px 'Segoe UI', Ubuntu, sans-serif; fill: #7ee787; }
  </style>
  <rect width="100%" height="100%" class="bg" />
  
  <text x="20" y="40" class="text-title">${username}'s Open Source Journey</text>
  
  <text x="20" y="80" class="text-stat">🔥 Total Contributions (1 yr):</text>
  <text x="240" y="80" class="text-value">${totalCommits}</text>

  <text x="20" y="120" class="text-stat">📚 Public Repositories:</text>
  <text x="240" y="120" class="text-value">${totalRepos}</text>

  <text x="20" y="160" class="text-stat">⭐ Total Stars Earned:</text>
  <text x="240" y="160" class="text-value">${totalStars}</text>
</svg>`;

  fs.writeFileSync('my-metrics.svg', svg);
  console.log("Successfully generated my-metrics.svg!");
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
