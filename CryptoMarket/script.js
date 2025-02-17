document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-link');
    const activeLink = localStorage.getItem('activeLink');

    if (activeLink) {
        links.forEach(link => {
            if (link.href === activeLink) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }

            links.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            localStorage.setItem('activeLink', this.href);
        });
    });

    // Retrieve and display the active section
    const activeSection = localStorage.getItem('activeSection');
    if (activeSection === 'coin_section') {
        const storedCoinData = localStorage.getItem('coinData');
        const storedChartData = localStorage.getItem('chartData');
        if (storedCoinData && storedChartData) {
            displayCoinInfo(JSON.parse(storedCoinData), JSON.parse(storedChartData));
        }
    } else {
        displayTopCoinsList();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const btns = document.querySelectorAll('.nav-BTN');
    btns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            btns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

const settingBTN_id = document.getElementById('settingBTN_id');

settingBTN_id.addEventListener("click", () => {
    const settingListBox = document.querySelector('.settingListBox');
    if (settingListBox.style.display === 'none' || settingListBox.style.display === '') {
        settingListBox.style.display = 'block';
    } else {
        settingListBox.style.display = 'none';
    }
});

document.getElementById("tableContent_id").addEventListener("click", function(event) {
    if (event.target.closest('.favBTN')) {
        const btn = event.target.closest('.favBTN');
        if (btn.style.color === 'lightgray' || btn.style.color === '') {
            btn.style.color = 'rgb(250, 217, 31)'; // Yellow
        } else {
            btn.style.color = 'lightgray';
        }
    }
});

const top_section = document.querySelector('.commonView');
const coin_section = document.querySelector('.individualView');

function displaySections(section) {
    [top_section, coin_section].forEach(section => section.style.display = 'none');
    section.style.display = 'block';
    localStorage.setItem('activeSection', section.classList.contains('individualView') ? 'coin_section' : 'top_section');
}

const MarketChart_url = 'https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=7';
const tableBody = document.getElementById("tableContent_id");

async function displayTopCoinsList() {
    const TopCoins_url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';

    try {
        const response_top = await fetch(TopCoins_url);
        const data_top = await response_top.json();
        tableBody.innerHTML = "";

        data_top.forEach((coin, index) => {
            const row = `
                <tr>
                    <td>
                        <button class="favBTN">
                            <span class="material-symbols-outlined">stars</span>
                        </button>
                    </td>
                    <td>${index + 1}</td>
                    <td><img src="${coin.image}" alt="${coin.name}" style="width: 20px; height:20px;"><button style="border:none; background-color:transparent; cursor:pointer;"> ${coin.name}</button> (${coin.symbol.toUpperCase()})</td>
                    <td>$${coin.market_cap.toLocaleString()}</td>
                    <td>$${coin.current_price.toLocaleString()}</td>
                    <td style="color: ${coin.price_change_percentage_24h >= 0 ? 'green' : 'red'};">
                        ${coin.price_change_percentage_24h.toFixed(2)}%
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        displaySections(top_section);
    } catch (error) {
        console.error("Error fetching market data:", error);
    }
}

async function displayTrendingCoinsList() {
    const Trending_url = 'https://api.coingecko.com/api/v3/search/trending';

    try {
        const response_trend = await fetch(Trending_url);
        const data_trend = await response_trend.json();
        tableBody.innerHTML = "";

        data_trend.coins.forEach((coinData, index) => {
            const coin = coinData.item;

            const row = `
                <tr>
                    <td>
                        <button class="favBTN" style="border: none; background: transparent; cursor: pointer;">
                            <span class="material-symbols-outlined">stars</span>
                        </button>
                    </td>
                    <td>${index + 1}</td>
                    <td>
                        <img src="${coin.thumb}" alt="${coin.name}" style="width: 20px; height: 20px; vertical-align: middle;">
                        <button style="border: none; background: transparent; cursor: pointer;">${coin.name}</button>
                        (${coin.symbol.toUpperCase()})
                    </td>
                </tr>
            `;

            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching trending coins:", error);
    }
}

function CoinInfo() {
    const searchValue = document.getElementById('search_id').value.trim().toLowerCase();

    if (!searchValue) {
        alert('Please enter the name of a cryptocurrency');
        return;
    }

    fetch(`https://api.coingecko.com/api/v3/search?query=${searchValue}`)
        .then(response => response.json())
        .then(data => {
            if (data.coins.length === 0) {
                alert('Cryptocurrency not found!');
                return;
            }

            const coinId = data.coins[0].id;
            fetchCoinDetails(coinId);
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            alert('Error searching for the coin!');
        });
}

function fetchCoinDetails(coinId) {
    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`)
                .then(response => response.json())
                .then(chartData => {
                    // Store the coin data and chart data in local storage
                    localStorage.setItem('coinData', JSON.stringify(data));
                    localStorage.setItem('chartData', JSON.stringify(chartData));
                    displayCoinInfo(data, chartData);
                })
                .catch(error => {
                    console.error('Error fetching chart data:', error);
                    alert('Error fetching coin chart data!');
                });
        })
        .catch(error => {
            console.error('Error fetching coin details:', error);
            alert('Error fetching coin details!');
        });
}

let chartInstance = null;
function displayCoinInfo(data, chartData) {
    const coinImg_id = document.getElementById('coinImg_id');
    const coinName_id = document.getElementById('coinName_id');
    const symbol_id = document.getElementById('symbol_id');
    const description_id = document.getElementById('description_id');
    const market_price_id = document.getElementById('market_price_id');
    const market_cap_id = document.getElementById('market_cap_id');
    const total_volume_id = document.getElementById('total_volume_id');
    const price_change_id = document.getElementById('price_change_id');
    const circulating_supply_id = document.getElementById('circulating_supply_id');
    const total_supply_id = document.getElementById('total_supply_id');
    const priceChart_id = document.getElementById('priceChart_id');

    // Populate coin details
    coinImg_id.src = data.image.large;
    coinName_id.innerHTML = data.name;
    symbol_id.innerHTML = `(${data.symbol.toUpperCase()})`;
    description_id.innerHTML = data.description.en;
    market_price_id.innerHTML = `$${data.market_data.current_price.usd.toLocaleString()}`;
    market_cap_id.innerHTML = `$${data.market_data.market_cap.usd.toLocaleString()}`;
    total_volume_id.innerHTML = `$${data.market_data.total_volume.usd.toLocaleString()}`;
    price_change_id.innerHTML = `${data.market_data.price_change_percentage_24h.toFixed(2)}%`;
    circulating_supply_id.innerHTML = data.market_data.circulating_supply;
    total_supply_id.innerHTML = data.market_data.total_supply
        ? data.market_data.total_supply.toLocaleString()
        : "N/A";

    // Prepare chart data
    const prices = chartData.prices.map(price => price[1]);
    const dates = chartData.prices.map(price => {
        const date = new Date(price[0]);
        return date.toLocaleDateString();
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create the chart
    chartInstance = new Chart(priceChart_id, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Price in USD',
                data: prices,
                borderColor: '#6366f1',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    }
                }
            }
        }
    });

    displaySections(coin_section);
}

displayTopCoinsList();

const TrendingBTN_id = document.getElementById('TrendingBTN_id');
const TopBTN_id = document.getElementById('TopBTN_id');
const homeLink = document.querySelector('.nav-link[href="index.html"]');
const homepageLink = document.querySelector('.homepage');

TopBTN_id.addEventListener("click", () => {
    displayTopCoinsList();
});

TrendingBTN_id.addEventListener("click", () => {
    displayTrendingCoinsList();
});

homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    displayTopCoinsList();
    localStorage.setItem('activeSection', 'top_section');
});

homepageLink.addEventListener("click", (e) => {
    e.preventDefault();
    displayTopCoinsList();
    localStorage.setItem('activeSection', 'top_section');
});