class RENDERDATA {
    constructor() {
        this.$mainTokenDom = document.querySelector("[template-wrapper='token-data']");
        this.$tokenPriceElement = this.$mainTokenDom?.querySelector("[token-data='price']");
        this.$changePercentElement = this.$mainTokenDom?.querySelector("[token-data='change-update']");
        this.$changeDurationElement = this.$mainTokenDom?.querySelector("[token-data='change-duration']");
        this.$tokenSlug = this.$mainTokenDom?.querySelector(".project-temp_short-name");

        this.$chartWrapper = this.$mainTokenDom?.querySelector("[token-data='chart']");

        this.$marketCapElement = this.$mainTokenDom?.querySelector("[token-data='market-cap']");
        this.$dilutedMarketCapElement = this.$mainTokenDom?.querySelector("[token-data='diluted-mkt-cap']");
        this.$circulatingSupplyElement = this.$mainTokenDom?.querySelector("[token-data='circulating-supply']");
        this.$circulatingPercentElement = this.$mainTokenDom?.querySelector("[token-data='circulating-percent']");
        this.$totalSupplyElement = this.$mainTokenDom?.querySelector("[token-data='total-supply']");
        this.$holderElement = this.$mainTokenDom?.querySelector("[token-data='holders']");
        this.$dailyVolumeElement = this.$mainTokenDom?.querySelector("[token-data='daily-volume']");
        this.$oneUsdElement = this.$mainTokenDom?.querySelector("[token-data='one-usd']");
        this.$releaseDateElement = this.$mainTokenDom?.querySelector("[token-data='release-date']");

        this.$mainDropDownWrapper = this.$mainTokenDom?.querySelector("[home-wrapper='dropdown']");
        this.$activeComponent = this.$mainDropDownWrapper?.querySelector("[dropdown-active='component']");
        this.$allCurrencyCategory = this.$mainDropDownWrapper?.querySelectorAll("[dropdown]");
        this.$activeCurrencyImageElement = this.$activeComponent?.querySelector("img");
        this.$activeCurrencyText = this.$activeComponent?.querySelector(".tabs_dropdown-text");

        this.$durationTabs = [...this.$mainTokenDom?.querySelectorAll("[token-data-ctrl]")];

        this.$loader = document.querySelector("[wrapper='loader']");
        this.$wrapperToShow = document.querySelector("[wrapper='show']");

        this.$downloadButton = document.querySelector("[token-button='download']");

        this.GLOBAL_DATA_OBJECT = {
            activeCurrency: "usd",
            tokenData: null,
            activeTab: "one-day",
            renderNewChart: true,
            chart: null,
            areaSeries: null,
        }

        this.loadTokenDataAPI = "https://cron-jobs.milan-houter.workers.dev/";

        this.options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "triggerType": "individual_data", "asset": this.$tokenSlug?.textContent
            }),
        }

        this.init();
    }

    init() {
        this.loadDataFromAPI();
        this.addFilterListeners();
    }

    addFilterListeners() {
        if (this.$allCurrencyCategory?.length > 0) {
            this.$allCurrencyCategory.forEach(currency => {
                currency.addEventListener("click", (evt) => {
                    let selectedCurrencyElement = evt.currentTarget;
                    let selectedCurrency = selectedCurrencyElement?.getAttribute("dropdown");
                    let selectedCurrencyName = selectedCurrencyElement.textContent;
                    let selectedCurrencyImage = selectedCurrencyElement?.querySelector("img")?.getAttribute("src");

                    this.$activeCurrencyImageElement.removeAttribute("srcset");
                    this.$activeCurrencyImageElement.setAttribute("src", selectedCurrencyImage);
                    this.$activeCurrencyText.textContent = selectedCurrencyName;
                    this.GLOBAL_DATA_OBJECT.activeCurrency = selectedCurrency;

                    this.GLOBAL_DATA_OBJECT.renderNewChart = false;
                    this.renderDataOnChart();
                    this.renderDataOnDom();


                })
            })
        }

        if (this.$durationTabs?.length > 0) {
            this.$durationTabs.forEach(tab => {
                tab.addEventListener("click", (evt) => {
                    let currentTabElement = evt.currentTarget;
                    let tabToActive = currentTabElement?.childNodes[0];
                    let tabToInactive = this.$durationTabs.filter(tab =>{
                    return tab.childNodes[0].classList.contains("active-tab")
                });
                    tabToInactive[0].childNodes[0].classList.remove("active-tab");
                    tabToActive.classList.add("active-tab");
                    let selectedDuration = currentTabElement?.getAttribute("token-data-ctrl");
                    this.GLOBAL_DATA_OBJECT.activeTab = selectedDuration;
                    this.GLOBAL_DATA_OBJECT.renderNewChart = false
                    this.renderDataOnChart();
                    this.renderDataOnDom();
                })
            })
        }
        if(this.$downloadButton  != null){
            this.$downloadButton.addEventListener("click",()=>{
                this.downloadChart();
            })
        }
    }

    async loadDataFromAPI() {
        let callAPI = await fetch(this.loadTokenDataAPI, this.options).catch(err => console.log(err));
        let extractData = await callAPI.json();
        if (Object.keys(extractData).length > 0) {
            this.GLOBAL_DATA_OBJECT.tokenData = extractData;
            console.log(this.GLOBAL_DATA_OBJECT)
            
            this.renderDataOnDom();
            this.renderDataOnChart();
            this.renderSwapper();
            
            this.$wrapperToShow.style.opacity = 1;
            this.$loader.remove();
        }
    }

    renderSwapper(){
        let scriptElement = document.createElement("script");
        scriptElement.type = "module";
        scriptElement.innerHTML = `ReactDOM.render( React.createElement( dexhunterSwap, {"orderTypes":["SWAP","LIMIT"],"defaultToken":"${this.GLOBAL_DATA_OBJECT.tokenData["asset_id"]}","colors":{"background":"#FFFFFF","containers":"#F6F6F9","subText":"#859DA2","mainText":"#11424A","buttonText":"#FFFFFF","accent":"#00D061"},"theme":"light","width":"100%","partnerCode":"cardanocube.io616464723171396666367678737577656775683370667135716b6164756361746a65343468346a6437373678637a7266377466346c77733564666d6a6c68687133356c72717865367539633575667a7a733361306479357a3433746c32377466737a3875366c7ada39a3ee5e6b4b0d3255bfef95601890afd80709","partnerName":"CardanoCube.io"} ), document.getElementById('dexhunter-root') );`;
        document.body.appendChild(scriptElement)
    }
    renderDataOnDom() {
        if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
            this.$tokenPriceElement.textContent = "$" + this.reduceNumber(this.GLOBAL_DATA_OBJECT.tokenData?.price_in_usd);

            if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(token["24h_change_usd"])) {
                    tokenMonthChange.classList.remove("is-low")
                    tokenMonthChange.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "24H";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "7D";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "1M";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "1Y";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_usd"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "All";
            }

        }
        else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
            this.$tokenPriceElement.textContent = this.reduceNumber(this.GLOBAL_DATA_OBJECT.tokenData?.price_in_ada) + "₳";

            if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["24h_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "24H";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["7d_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "7D";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }

                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["1mo_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }

                this.$changeDurationElement.textContent = "1M";

            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (!this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_1y_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "1Y";
            }
            else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
                this.$changePercentElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"] && this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"], true) + "%"

                if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"])) {
                    this.$changePercentElement.classList.add("is-low")
                    this.$changePercentElement.classList.remove("is-high")
                }
                else if (this.checkIfLowOrHigh(this.GLOBAL_DATA_OBJECT.tokenData["percentage_all_change_ada"])) {
                    this.$changePercentElement.classList.remove("is-low")
                    this.$changePercentElement.classList.add("is-high")
                }
                this.$changeDurationElement.textContent = "All";
            }

        }

        // ** Render other data
        this.$marketCapElement.textContent = "Not-available";

        this.$dilutedMarketCapElement.textContent = "Not-available";

        this.$circulatingSupplyElement.textContent = "Not-available";

        this.$circulatingPercentElement.textContent = "Not-available";

        let decimalAddedTotalSupply = this.GLOBAL_DATA_OBJECT.tokenData["total_supply"] && this.cutZeros(this.GLOBAL_DATA_OBJECT.tokenData["total_supply"], this.GLOBAL_DATA_OBJECT.tokenData["decimals"]);

        let total_supply = decimalAddedTotalSupply

        this.$totalSupplyElement.textContent = this.convertToInternationalCurrencySystem(total_supply) + " " + this.$tokenSlug.textContent;

        this.$holderElement.textContent = this.formatNumberWithCommas(this.GLOBAL_DATA_OBJECT.tokenData["holders"], false);

        let dailyVolume = this.formatNumberWithCommas(this.GLOBAL_DATA_OBJECT.tokenData["24h_vol_usd"]);

        this.$dailyVolumeElement.textContent = "$" + dailyVolume;

        this.$oneUsdElement.textContent = this.formatNumber(this.GLOBAL_DATA_OBJECT.tokenData["1USD"]) + " " + this.$tokenSlug.textContent;

        this.$releaseDateElement.textContent = this.GLOBAL_DATA_OBJECT.tokenData["created_date"] && new Date(this.GLOBAL_DATA_OBJECT.tokenData["created_date"]).getFullYear();
    }

    cutZeros(number, zerosToCut) {
        if(zerosToCut == 0)return number;
        let strNum = number.toString();
        return strNum.slice(0, -zerosToCut);
    }


    renderDataOnChart() {
        if (this.GLOBAL_DATA_OBJECT.activeTab == "one-day") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_24h_usd"]);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_24h_ada"]);

            }
        }
        else if (this.GLOBAL_DATA_OBJECT.activeTab == "seven-day") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_7d_usd"]);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_7d_ada"]);

            }

        } else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-month") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1mo_usd"]);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1mo_ada"]);

            }

        } else if (this.GLOBAL_DATA_OBJECT.activeTab == "one-year") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1y_usd"]);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_1y_ada"]);

            }

        }
        else if (this.GLOBAL_DATA_OBJECT.activeTab == "all") {
            if (this.GLOBAL_DATA_OBJECT.activeCurrency == "usd") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_all_usd"]);
            } else if (this.GLOBAL_DATA_OBJECT.activeCurrency == "ada") {
                this.createLineChart(this.$chartWrapper, this.GLOBAL_DATA_OBJECT.tokenData["chart_all_ada"]);

            }

        }
    }
    createLineChart(element, data) {
        let chartHeight = parseFloat(window.getComputedStyle(element).height);
        let chartWidth= parseFloat(window.getComputedStyle(element).width);
        // Convert object to array of objects
        const dataArray = Object.entries(data).map(([date, value]) => ({ date, value }));

        // Sort the array by date in ascending order
        dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Convert the sorted array back to object
        const sortedChartData = dataArray.reduce((acc, { date, value }) => {
            acc[date] = value;
            return acc;
        }, {});


        if (this.GLOBAL_DATA_OBJECT.renderNewChart) {
            // Create a new Lightweight Chart
            this.GLOBAL_DATA_OBJECT.chart = LightweightCharts.createChart(element, {
                width: chartWidth,
                height: chartHeight, // Set the desired height
                layout: {
                    background: {
                        type: 'solid',
                        color: '#FFF',
                    },
                    borderVisible: true,
                },
                grid: {
                    horzLines: {
                        color: 'transparent', // Hide horizontal grid lines
                    },
                    vertLines: {
                        color: 'transparent', // Hide vertical grid lines
                    },
                },
                rightPriceScale: {
                    visible: true, // Hide the right price scale
                    borderVisible: false,
                },
                timeScale: {
                    visible: true, // Hide the time scale
                    borderVisible: false,
                },
            });

            const chartData = this.formatData(sortedChartData);

            this.GLOBAL_DATA_OBJECT.areaSeries = this.GLOBAL_DATA_OBJECT.chart.addAreaSeries({
                lineColor: '#3861F6',
                topColor: '#BCCBFB',
                bottomColor: 'rgb(240 243 254)',
                priceLineVisible: false,

            });
            this.GLOBAL_DATA_OBJECT.areaSeries.setData(chartData);
        }

        if (!this.GLOBAL_DATA_OBJECT.renderNewChart) {
            const chartData = this.formatData(sortedChartData);
            this.GLOBAL_DATA_OBJECT.areaSeries.setData(chartData);
        }

        this.GLOBAL_DATA_OBJECT.chart.timeScale().fitContent();



    }

    downloadChart() {
        const imageDataURL = this.GLOBAL_DATA_OBJECT.chart.takeScreenshot();
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL.toDataURL();
        const fileName = new Date().getFullYear();
        downloadLink.download = `chart${fileName}.png`; 
        downloadLink.click();
    }

    formatData(dataObject) {
        const formattedData = [];

        for (const timestamp in dataObject) {
            if (dataObject.hasOwnProperty(timestamp)) {
                const value = dataObject[timestamp];
                formattedData.push({ time: this.convertTimeDate(new Date(timestamp)), value });
            }
        }

        return formattedData;
    }

    convertTimeDate(inputTime) {
        // Parse the input time string into a Date object
        let date = new Date(inputTime);

        // Get the Unix timestamp (milliseconds since January 1, 1970)
        let timestamp = date.getTime();

        // Convert milliseconds to seconds
        timestamp = Math.floor(timestamp / 1000);

        return timestamp;

    }

    formatNumberWithCommas(number, isUSCurrency) {
        // Check if isUSCurrency is true or not
        if (isUSCurrency) {
            // Format as US currency (e.g., 1,234.56)
            return number.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        } else {
            // Format as normal currency (e.g., 1 234,56)
            return number.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
    }

    convertToInternationalCurrencySystem(labelValue) {

        // Nine Zeroes for Billions
        return Math.abs(Number(labelValue)) >= 1.0e+9

            ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
            // Six Zeroes for Millions 
            : Math.abs(Number(labelValue)) >= 1.0e+6

                ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
                // Three Zeroes for Thousands
                : Math.abs(Number(labelValue)) >= 1.0e+3

                    ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

                    : Math.abs(Number(labelValue));

    }


    checkIfLowOrHigh(token) {
        return token?.toString()?.startsWith("-");
    }

    reduceNumber(num) {
        // Convert number to string
        let numStr = num.toString();

        // Find the position of the decimal point
        let decimalIndex = numStr.indexOf('.');

        // If decimal point exists
        if (decimalIndex !== -1) {
            // Keep only three digits after the decimal point
            numStr = parseFloat(numStr).toFixed(6).slice(0, decimalIndex + 5);

            // Remove any trailing zeros beyond the third digit
            numStr = numStr.replace(/(\.\d*?[1-9])0+$/, '$1');
        }

        return numStr;
    }

    formatNumber(num, removeNeg) {
        // Remove "-" sign if present
        removeNeg ? num = Math.abs(num) : "";

        if (num >= 1000) {
            return (num / 1000).toFixed(2) + "K";
        } else {
            return num?.toFixed(2);
        }
    }
}

new RENDERDATA;