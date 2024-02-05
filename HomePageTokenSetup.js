import MobileSlider from "./PromotedSlider.js";
class LOADANDRENDERTOKENS {
    constructor() {
        this.$trendingTokenWrapper = document.querySelectorAll("[home-wrapper='trending-token']");


        this.$topGainersWrapper = document.querySelectorAll("[home-wrapper='top-gainers']");

        this.$trendingTokenLoading = document.querySelector("[trending-token='loading']");

        this.$promotedWrapper = document.querySelectorAll("[promoted='wrapper']");

        this.$filterWrapper = document.querySelector("[home-wrapper='filter-wrapper']");
        this.$filterBtnArray = [...this.$filterWrapper?.querySelectorAll("[filter-type]")];

        this.$tokensContainer = document.querySelector("[home-wrapper='tokens']");
        this.$tokensToInjectWrapper = this.$tokensContainer?.querySelector("[tokens='injection']");
        this.$tokenLoading = document.querySelector("[tokens='loading']");

        this.$tokenItem = [...document.querySelectorAll("[token='item']")];
        this.$cmsArrayParent = document.querySelector(".project_list-wrapper");
        this.$tokenItemToClone = this.$tokensToInjectWrapper?.querySelector("[token-item='to-clone']");

        this.$mainDropDownWrapper = document.querySelector("[home-wrapper='dropdown']");
        this.$activeComponent = this.$mainDropDownWrapper?.querySelector("[dropdown-active='component']");
        this.$allCurrencyCategory = [...this.$mainDropDownWrapper?.querySelectorAll("[dropdown]")];
        this.$activeCurrencyImageElement = this.$activeComponent?.querySelector("img");
        this.$activeCurrencyText = this.$activeComponent?.querySelector(".tabs_dropdown-text");

        this.$loadMore = document.querySelector(".project_pagination-btn");

        this.loadAllTokensAPI = "https://cron-jobs.milan-houter.workers.dev/";
        this.options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "triggerType": "latest_data" }),
        }

        this.globalObject = {
            // activeCategory: "top-50",
            activeCategory: "trending",
            activeCurrency: "usd",
            cookieName:"currentCurrency",
            tokensData: null,
            tokensToRender: 5,
            topFiftyTokens: [],
            trendingTokens: [],
            topGainerTokens: [],
            topLoserTokens: [],
            topFiftyTokensToRender: [],
            trendingTokensToRender: [],
            topGainerTokensToRender: [],
            topLoserTokensToRender: [],
            topFiftyTokensToRenderPosition: 0,
            trendingTokensToRenderPosition: 0,
            topGainerTokensToRenderPosition: 0,
            topLoserTokensToRenderPosition: 0,
        }

        this.init()
    }

    init() {
        this.loadDataFromApi();
    }

    async loadDataFromApi() {
        let callAPI = await fetch(this.loadAllTokensAPI, this.options).catch(err => console.log(err));
        let extractData = await callAPI.json();
        if (Object.keys(extractData).length > 0) {
            this.globalObject.tokensData = extractData;
            this.globalObject.activeCurrency=this.checkCookie(this.globalObject.cookieName)??"usd";
            this.dropDownCurrency = this.$allCurrencyCategory.filter(item => item.getAttribute("dropdown")===this.globalObject.activeCurrency);
            if(this.dropDownCurrency?.length>0){
                this.updateDropDown(this.dropDownCurrency[0])
            }
            this.addImageAndPageURl();
            this.filterTokens();
            this.sortTokens();
            this.splitAndRender(true);
            this.addFilterListener();
            this.addDataOnHeroSection();
            this.handleOpacityOnResize();

            // ** Activate mobile slider
            MobileSlider();
        }
    }

    addImageAndPageURl() {
        if (this.globalObject.tokensData.length > 0) {
            let tokenCode, matchDomElement, tokenCodeElement, imageElement, imageUrl, urlElement, pageUrl;
            this.globalObject.tokensData.forEach(token => {
                tokenCode = token.asset;
                matchDomElement = this.$tokenItem.filter(tokenDom => {
                    tokenCodeElement = tokenDom?.querySelector("[token-item='type']");
                    return (tokenCode == tokenCodeElement?.textContent)
                })
                if (matchDomElement != null && matchDomElement?.length > 0) {
                    imageElement = matchDomElement[0]?.querySelector("[token-item='image']");
                    imageUrl = imageElement?.getAttribute("src");
                    urlElement = matchDomElement[0]?.querySelector("[token-url]");
                    pageUrl = urlElement.getAttribute("href");
                    token.imageUrl = imageUrl
                    token.pageUrl = pageUrl;
                }
            })

            // Remove parent
            this.$cmsArrayParent?.remove();
        }
    }

    filterTokens() {
        if (this.globalObject.tokensData.length > 0) {
            this.globalObject.tokensData.forEach(token => {

                // Write now its not possible.
                // For top 50 tokens
                // if(token?.trending?.rank!=undefined ||token?.trending?.rank!=null){
                //     this.globalObject.topFiftyTokens.push(token);
                // }

                // For trending tokens
                if (token?.trending?.rank != undefined || token?.trending?.rank != null) {
                    this.globalObject.trendingTokens.push(token);
                }
                // For top losers tokens
                if (token?.top_loser?.rank != undefined || token?.top_loser?.rank != null) {
                    this.globalObject.topLoserTokens.push(token);
                }
                // For top gainers tokens
                if (token?.top_gainer?.rank != undefined || token?.top_gainer?.rank != null) {
                    this.globalObject.topGainerTokens.push(token);
                }
            })
        }
    }

    splitAndRender(split) {
        // write now its not possible.
        // if(this.globalObject.activeCategory=="top-50"){

        // }
        if (this.globalObject.activeCategory == "trending") {
            if (split) {
                let trendingTokensToRender = this.splitTokens(this.globalObject.trendingTokens, this.globalObject.trendingTokensToRenderPosition, "trendingTokensToRenderPosition");

                this.globalObject.trendingTokensToRender.push(...trendingTokensToRender);
            }

            this.renderDataOnDom(this.globalObject.trendingTokensToRender);

            this.enableDisableLoadMore(this.globalObject.trendingTokens, this.globalObject.trendingTokensToRender);

        }
        else if (this.globalObject.activeCategory == "top-gainers") {
            if (split) {
                let topGainerTokensToRender = this.splitTokens(this.globalObject.topGainerTokens, this.globalObject.topGainerTokensToRenderPosition, "topGainerTokensToRenderPosition");

                this.globalObject.topGainerTokensToRender.push(...topGainerTokensToRender)
            }

            this.renderDataOnDom(this.globalObject.topGainerTokensToRender);

            this.enableDisableLoadMore(this.globalObject.topGainerTokens, this.globalObject.topGainerTokensToRender)

        }
        else if (this.globalObject.activeCategory == "top-losers") {
            if (split) {
                let topLoserTokensToRender = this.splitTokens(this.globalObject.topLoserTokens, this.globalObject.topLoserTokensToRenderPosition, "topLoserTokensToRenderPosition");

                this.globalObject.topLoserTokensToRender.push(...topLoserTokensToRender)
            }

            this.renderDataOnDom(this.globalObject.topLoserTokensToRender);

            this.enableDisableLoadMore(this.globalObject.topLoserTokens, this.globalObject.topLoserTokensToRender)

        }


    }

    addFilterListener() {
        if (this.$filterBtnArray?.length > 0) {
            this.$filterBtnArray.forEach(btn => {
                if (btn?.getAttribute("filter-type") != this.globalObject.activeCategory) {
                    btn.setAttribute("split", true);
                } else {
                    btn.setAttribute("split", false);
                }
                btn.addEventListener("click", (evt) => {
                    let currentSelectedFilter = evt.currentTarget;
                    let currentFilterVal = currentSelectedFilter?.getAttribute("filter-type");
                    let doSplit = currentSelectedFilter?.getAttribute("split");
                    this.globalObject.activeCategory = currentFilterVal;
                    let filterToDisable = this.$filterBtnArray.filter(item => item.classList.contains("is-active"));
                    filterToDisable[0]?.classList.remove("is-active");
                    currentSelectedFilter.classList.add("is-active");
                    if (doSplit == "true") {
                        this.splitAndRender(true);
                        currentSelectedFilter.setAttribute("split", false);
                    } else {
                        this.splitAndRender(false);
                    }
                })
            })
        }
        if (this.$allCurrencyCategory?.length > 0) {
            this.$allCurrencyCategory.forEach(currency => {
                currency.addEventListener("click", (evt) => {
                    let selectedCurrencyElement = evt.currentTarget;
                   this.updateDropDown(selectedCurrencyElement)
                    this.updateCookie(this.globalObject.cookieName, this.globalObject.activeCurrency, 30);
                    this.splitAndRender(false);
                    this.addDataOnHeroSection();

                })
            })
        }

        if (this.$loadMore != undefined) {
            this.$loadMore.setAttribute("active-category", this.globalObject.activeCategory);
            this.$loadMore.addEventListener("click", () => {
                this.splitAndRender(true);
            })
        }

    }

    updateDropDown(elementToActive){
        let selectedCurrency = elementToActive?.getAttribute("dropdown");
        let selectedCurrencyName = elementToActive.textContent;
        let selectedCurrencyImage = elementToActive?.querySelector("img")?.getAttribute("src");

        this.$activeCurrencyImageElement.removeAttribute("srcset");
        this.$activeCurrencyImageElement.setAttribute("src", selectedCurrencyImage);
        this.$activeCurrencyText.textContent = selectedCurrencyName;
        this.globalObject.activeCurrency = selectedCurrency;
    }

    sortTokens() {
        // sort top 50 tokens
        // Write now its not possible.

        // Filter trending
        let sortedTokens = this.globalObject.trendingTokens.sort((a, b) => a.trending.rank - b.trending.rank);
        this.globalObject.trendingTokens = sortedTokens;

        // sort top_gainer tokens
        sortedTokens = this.globalObject.topGainerTokens.sort((a, b) => a.top_gainer.rank - b.top_gainer.rank);
        this.globalObject.topGainerTokens = sortedTokens;

        // sort top_losers tokens
        sortedTokens = this.globalObject.topLoserTokens.sort((a, b) => a.top_loser.rank - b.top_loser.rank);
        this.globalObject.topLoserTokens = sortedTokens;
    }

    renderDataOnDom(tokenObjectArray) {
        this.clearDom(this.$tokensToInjectWrapper);
        this.$tokenLoading.remove();
        if (tokenObjectArray?.length > 0) {
            tokenObjectArray.forEach((token, index) => {
                let clonedToken = this.$tokenItemToClone.cloneNode(true);
                let indexElement = clonedToken?.querySelector("[token-item='index']");
                let urlElement = clonedToken?.querySelector("[token-url]");
                let tokenImage = clonedToken?.querySelector("[token-item='image']");
                let tokenName = clonedToken?.querySelector("[token-item='name']");
                let tokenType = clonedToken?.querySelector("[token-item='type']");
                let tokenPrice = clonedToken?.querySelector("[token-item='price']");
                let tokenMarketMobile = clonedToken?.querySelector("[token-item='market-cap-mb']");
                let tokenDayChange = clonedToken?.querySelector("[token-item='24h-change']");
                let tokenWeekChange = clonedToken?.querySelector("[token-item='7d-change']");
                let tokenMonthChange = clonedToken?.querySelector("[token-item='30d-change']");
                let tokenMarketCap = clonedToken?.querySelector("[token-item='market-cap']");
                let tokenVolume = clonedToken?.querySelector("[token-item='volume']");
                let tokenChartWrapper = clonedToken?.querySelector("[token-item='chart']");

                indexElement.textContent = index + 1;
                urlElement.setAttribute("href", token.pageUrl);
                tokenImage.setAttribute("src", token.imageUrl);

                tokenName.textContent = token.fullName;
                tokenType.textContent = token.asset;

                // Add filter check
                if (this.globalObject.activeCurrency == "usd") {
                    if (this.checkIfLowOrHigh(token["24h_change_usd"])) {
                        tokenDayChange.classList.add("is-low")
                        tokenDayChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["24h_change_usd"])) {
                        tokenDayChange.classList.remove("is-low")
                        tokenDayChange.classList.add("is-high")
                    }

                    if (this.checkIfLowOrHigh(token["7d_change_usd"])) {
                        tokenWeekChange.classList.add("is-low")
                        tokenWeekChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["7d_change_usd"])) {
                        tokenWeekChange.classList.remove("is-low")
                        tokenWeekChange.classList.add("is-high")
                    }

                    if (this.checkIfLowOrHigh(token["1mo_change_usd"])) {
                        tokenMonthChange.classList.add("is-low")
                        tokenMonthChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["1mo_change_usd"])) {
                        tokenMonthChange.classList.remove("is-low")
                        tokenMonthChange.classList.add("is-high")
                    }

                    tokenPrice.textContent = "$" + this.reduceNumber(token.price_in_usd);
                    tokenMarketCap.textContent = "not available"
                    tokenMarketMobile.textContent = "not available"
                    tokenDayChange.textContent = token["24h_change_usd"] && this.formatNumber(token["24h_change_usd"], true) + "%";
                    tokenWeekChange.textContent = token["7d_change_usd"] && this.formatNumber(token["7d_change_usd"], true) + "%";
                    tokenMonthChange.textContent = token["1mo_change_usd"] && this.formatNumber(token["1mo_change_usd"], true) + "%";
                    tokenVolume.textContent = "$" + token["24h_vol_usd"]?.toFixed(3);

                    this.createLineChart(tokenChartWrapper, token["chart_7d_usd"], token["7d_change_usd"]);

                }

                if (this.globalObject.activeCurrency == "ada") {

                    if (this.checkIfLowOrHigh(token["24h_change_ada"])) {
                        tokenDayChange.classList.add("is-low")
                        tokenDayChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["24h_change_ada"])) {
                        tokenDayChange.classList.remove("is-low")
                        tokenDayChange.classList.add("is-high")
                    }

                    if (this.checkIfLowOrHigh(token["7d_change_ada"])) {
                        tokenWeekChange.classList.add("is-low")
                        tokenWeekChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["7d_change_ada"])) {
                        tokenWeekChange.classList.remove("is-low")
                        tokenWeekChange.classList.add("is-high")
                    }

                    if (this.checkIfLowOrHigh(token["1mo_change_ada"])) {
                        tokenMonthChange.classList.add("is-low")
                        tokenMonthChange.classList.remove("is-high")
                    }
                    else if (!this.checkIfLowOrHigh(token["1mo_change_ada"])) {
                        tokenMonthChange.classList.remove("is-low")
                        tokenMonthChange.classList.add("is-high")
                    }

                    tokenPrice.textContent = this.reduceNumber(token.price_in_ada) + "₳";
                    tokenMarketCap.textContent = "not available"
                    tokenMarketMobile.textContent = "not available"
                    tokenDayChange.textContent = token["24h_change_ada"] && this.formatNumber(token["24h_change_ada"], true) + "%";
                    tokenWeekChange.textContent = token["7d_change_ada"] && this.formatNumber(token["7d_change_ada"], true) + "%";
                    tokenMonthChange.textContent = token["1mo_change_ada"] && this.formatNumber(token["1mo_change_ada"], true) + "%";
                    tokenVolume.textContent = token["24h_vol_ada"]?.toFixed(3) + "₳";

                    this.createLineChart(tokenChartWrapper, token["chart_7d_ada"], token["7d_change_ada"]);
                }


                clonedToken.style.opacity = "1"

                this.$tokensToInjectWrapper.appendChild(clonedToken);

            })

        }

    }

    createLineChart(element, data, checkNegative) {
        // Convert object to array of objects
        const dataArray = Object.entries(data).map(([date, value]) => ({ date, value }));

        // Sort the array by date in ascending order
        dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Convert the sorted array back to object
        const sortedChartData = dataArray.reduce((acc, { date, value }) => {
            acc[date] = value;
            return acc;
        }, {});


        // Create a new Lightweight Chart
        const chart = LightweightCharts.createChart(element, {
            width: 136, // Set the desired width
            height: 44, // Set the desired height
            layout: {
                background: {
                    type: 'solid',
                    color: '#f8f9fd',
                },
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
                visible: false, // Hide the right price scale
            },
            timeScale: {
                visible: false, // Hide the time scale
            },
            crosshairMarkerVisible: {
                visible: false, // Hide the time scale
            },
            pointMarkersVisible: {
                visible: false, // Hide the time scale
            },
        });

        // Add a line series to the chart
        const lineSeries = chart.addLineSeries({
            color: this.checkIfLowOrHigh(checkNegative) ? "#FF2C2C" : "#00D061", // Set the line color
            lineWidth: 2, // Set the line width
            priceLineVisible: false, // Display the price line
        });

        const chartData = this.formatData(sortedChartData);

        lineSeries.setData(chartData);


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

    checkIfLowOrHigh(token) {
        return token?.toString()?.startsWith("-");
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

    reduceNumber(num) {
       // Convert number to string
    let numStr = num.toString();

    // Find the position of the decimal point
    let decimalIndex = numStr.indexOf('.');

    // If decimal point exists
    if (decimalIndex !== -1) {
        // Keep only six digits after the decimal point
        numStr = parseFloat(numStr).toFixed(6).slice(0, decimalIndex + 7);

        // Remove any trailing zeros beyond the sixth digit
        numStr = numStr.replace(/(\.\d*?[1-9])0+$/, '$1');
    }

    return numStr;
    }

    clearDom(wrapper) {
        // Loop through all child nodes and remove them
        while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
        }
    }

    splitTokens(tokenArrayToSplit, position, positionVarName) {
        let tokensToSplitData = tokenArrayToSplit;
        let chunkSize = this.globalObject.tokensToRender;
        let startIndex = position;
        let endIndex = startIndex + chunkSize;
        this.globalObject[positionVarName] = endIndex;
        return tokensToSplitData.slice(startIndex, endIndex);
    }

    enableDisableLoadMore(mainArray, arrayToCheck) {
        if (mainArray.length === arrayToCheck.length) {
            this.$loadMore.style.display = "none";
        } else {
            this.$loadMore.style.display = "block";
        }
    }

    addDataOnHeroSection() {
        let topFourTrendingTokens = this.globalObject.trendingTokens.slice(0, 4);
        let topFourGainersTokens = this.globalObject.topGainerTokens.slice(0, 4);

        if (topFourTrendingTokens?.length > 0 && topFourGainersTokens?.length > 0) {
            this.$trendingTokenWrapper.forEach(wrapper => {
                this.$trendingTokenToInjectWrapper = wrapper?.querySelector("[trending-token='wrapper']");
                this.$trendingTokenToClone = wrapper?.querySelector("[trending-token='to-clone']");
                this.clearDom(this.$trendingTokenToInjectWrapper);
                if (topFourTrendingTokens?.length > 0 && topFourGainersTokens?.length > 0) {
                    topFourTrendingTokens.forEach(token => {
                        let clonedToken = this.$trendingTokenToClone.cloneNode(true);
                        let tokenImage = clonedToken?.querySelector("[trending-token='image']");
                        let tokenName = clonedToken?.querySelector("[trending-token='name']");
                        let tokenDayChange = clonedToken?.querySelector("[trending-token='24h-change']");

                        clonedToken.setAttribute("href", token.pageUrl);
                        tokenImage.setAttribute("src", token.imageUrl);

                        //** change token name
                        tokenName.textContent = token.asset;

                        tokenDayChange.textContent = "";

                        // Add filter check
                        if (this.globalObject.activeCurrency == "usd") {
                            if (this.checkIfLowOrHigh(token["24h_change_usd"])) {
                                tokenDayChange.classList.add("is-negative")
                                tokenDayChange.classList.remove("is-positive")
                                // tokenDayChange.textContent = "-";

                            }
                            else if (!this.checkIfLowOrHigh(token["24h_change_usd"])) {
                                tokenDayChange.classList.remove("is-negative")
                                tokenDayChange.classList.add("is-positive")
                                tokenDayChange.textContent = "+";

                            }

                            tokenDayChange.textContent += token["24h_change_usd"] && this.formatNumber(token["24h_change_usd"], false) + "%";

                        }

                        if (this.globalObject.activeCurrency == "ada") {

                            if (this.checkIfLowOrHigh(token["24h_change_ada"])) {
                                tokenDayChange.classList.add("is-negative")
                                tokenDayChange.classList.remove("is-positive")
                                // tokenDayChange.textContent = "-"; 

                            }
                            else if (!this.checkIfLowOrHigh(token["24h_change_ada"])) {
                                tokenDayChange.classList.remove("is-negative")
                                tokenDayChange.classList.add("is-positive")
                                tokenDayChange.textContent = "+";

                            }
                            tokenDayChange.textContent += token["24h_change_ada"] && this.formatNumber(token["24h_change_ada"], false) + "%";
                        }

                        clonedToken.style.opacity = 1;
                        this.$trendingTokenToInjectWrapper.style.opacity = 1

                        this.$trendingTokenToInjectWrapper.appendChild(clonedToken)

                    })
                }


            })

            this.$topGainersWrapper.forEach(wrapper => {
                this.$topGainerToInjectWrapper = wrapper?.querySelector("[top-gainers='wrapper']");
                this.$topGainerToClone = wrapper?.querySelector("[top-gainers='to-clone']");
                this.clearDom(this.$topGainerToInjectWrapper);
                topFourGainersTokens.forEach(token => {
                    let clonedToken = this.$topGainerToClone.cloneNode(true);
                    let tokenImage = clonedToken?.querySelector("[top-gainers='image']");
                    let tokenName = clonedToken?.querySelector("[top-gainers='name']");
                    let tokenDayChange = clonedToken?.querySelector("[top-gainers='24h-change']");

                    clonedToken.setAttribute("href", token.pageUrl);
                    tokenImage.setAttribute("src", token.imageUrl);

                    //** change token name
                    tokenName.textContent = token.asset;

                    tokenDayChange.textContent = "";


                    // Add filter check
                    if (this.globalObject.activeCurrency == "usd") {
                        if (this.checkIfLowOrHigh(token["24h_change_usd"])) {
                            tokenDayChange.classList.add("is-negative")
                            tokenDayChange.classList.remove("is-positive")
                            // tokenDayChange.textContent = "-";

                        }
                        else if (!this.checkIfLowOrHigh(token["24h_change_usd"])) {
                            tokenDayChange.classList.remove("is-negative")
                            tokenDayChange.classList.add("is-positive")
                            tokenDayChange.textContent = "+";

                        }

                        tokenDayChange.textContent += token["24h_change_usd"] && this.formatNumber(token["24h_change_usd"]) + "%";

                    }

                    if (this.globalObject.activeCurrency == "ada") {

                        if (this.checkIfLowOrHigh(token["24h_change_ada"])) {
                            tokenDayChange.classList.add("is-negative")
                            tokenDayChange.classList.remove("is-positive")
                            // tokenDayChange.textContent = "-";
                        }
                        else if (!this.checkIfLowOrHigh(token["24h_change_ada"])) {
                            tokenDayChange.classList.remove("is-negative")
                            tokenDayChange.classList.add("is-positive")
                            tokenDayChange.textContent = "+";
                        }
                        tokenDayChange.textContent += token["24h_change_ada"] && this.formatNumber(token["24h_change_ada"]) + "%";
                    }

                    clonedToken.style.opacity = 1;
                    this.$topGainerToInjectWrapper.style.opacity = 1

                    this.$topGainerToInjectWrapper.appendChild(clonedToken)

                })
            })
        }

        this.$promotedWrapper.forEach(wrapper => {
            wrapper.style.opacity = 1;
        });

        this.$trendingTokenLoading?.remove();


    }

    handleOpacityOnResize() {
        window.addEventListener("resize", () => {
            this.$trendingTokenWrapper.forEach(wrapper => {
                this.$trendingTokenToInjectWrapper = wrapper?.querySelector("[trending-token='wrapper']");
                this.$trendingTokenToInjectWrapper.style.opacity = "1";
            })
            this.$topGainersWrapper.forEach(wrapper => {
                this.$topGainerToInjectWrapper = wrapper?.querySelector("[top-gainers='wrapper']");
                this.$topGainerToInjectWrapper.style.opacity = "1";
            })
            this.$promotedWrapper.forEach(wrapper => {
                wrapper.style.opacity = 1;
            });
        })

    }

    checkCookie(cookieName) {
        // Split document.cookie into individual cookies
        let cookies = document.cookie.split(';');
        // Loop through the cookies
        for (let i = 0; i < cookies.length; i++) {
            // Split the cookie into name and value
            let cookie = cookies[i].trim().split('=');
            // Check if the cookie name matches the provided name
            if (cookie[0] === cookieName) {
                // Cookie exists, return its value
                return cookie[1];
            }
        }
        // Cookie does not exist
        return null;
    }

    updateCookie(cookieName, cookieValue, expirationDays) {
        let d = new Date();
        d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
    }


}

new LOADANDRENDERTOKENS;