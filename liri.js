require("dotenv").config();

var fs = require("fs");
var axios = require("axios");
var moment = require('moment');
var keys = require("./keys");
var Spotify = require('node-spotify-api');

var clientInput = process.argv;
var search = clientInput[2];
var term = clientInput.slice(3).join(" ");

function findMovie(movie) {
    axios.get("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&tomatoes=true&apikey=trilogy").then(
        function (response) {
            var divider = "\n====================================================\n";
            if (response.data.Response === "False") {
                console.log(divider + response.data.Error + divider);
            } else if (response.data.Response === "True") {
                var movieData = response.data;
                var movie = movieData.Title;
                var year = movieData.Year;
                var imdbRating = movieData.imdbRating;
                var rottenRating = getRating(movieData)

                function getRating(movieData) {
                    for (var i = 0; i < movieData.Ratings.length; i++)
                        if (movieData.Ratings[i].Source === "Rotten Tomatoes") {
                            return movieData.Ratings[i].Value
                        }
                }

                var countryProduced = movieData.Country;
                var language = movieData.Language;
                var plot = movieData.Plot;
                var actors = movieData.Actors;
                var divider = "\n====================================================\n"
                var terminalResponse = divider +
                    "Movie Title: " + movie +
                    "\nRelease Date: " + year +
                    "\nIMDB Rating: " + imdbRating +
                    "\nRotten Tomatoes: " + rottenRating +
                    "\nCountry: " + countryProduced +
                    "\nLanguage: " + language +
                    "\nPlot: " + plot +
                    "\nActors/Actresses: " + actors + divider;

                console.log(terminalResponse)

                fs.appendFile("log.txt", terminalResponse, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        }
    );
};

function findMusic(song) {
    var spotify = new Spotify(keys.spotify);

    spotify.search({
        type: 'track',
        query: song,
        limit: 1
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            var divider = "\n========================================================\n";

            var terminalResponse = divider + "Artist: " + data.tracks.items[0].album.artists[0].name +
                "\nSong Title: " + data.tracks.items[0].name +
                "\nAlbum Title: " + data.tracks.items[0].album.name +
                "\nLink to Song: " + data.tracks.items[0].external_urls.spotify + divider;
            console.log(terminalResponse);

            fs.appendFile("log.txt", terminalResponse, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    });
}

function findConcert(artist) {
    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp").then(
        function (response, error) {
            if (error) {
                console.log("not in concert");
                return
            } else {
                var concertData = response.data;
                var divider = "\n============================= " + artist + " In Concert =============================\n";
                var dividerTwo = "\n-----------------------------------------------------";

                console.log(divider)

                fs.appendFile("log.txt", divider, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });

                for (var i = 0; i < concertData.length; i++) {
                    var venue = concertData[i].venue.name;
                    var city = concertData[i].venue.city;
                    var country = concertData[i].venue.country;
                    var when = moment(concertData[i].datetime).format('MM/DD/YYYY');

                    var terminalResponse = venue + "\n" + city + ", " + country + "\n" + when + dividerTwo;
                    console.log(terminalResponse);

                    fs.appendFile("log.txt", terminalResponse, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                }
            }
        }
    );
};

function randomTxt() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        if (dataArr === "do-what-it-says") {
            throw "Error: Infinite Loop"
        } else {
            console.log(dataArr[0]);
            console.log(dataArr[1] + "\n");
            liriBot(dataArr[0], dataArr[1])
        }
    });
}

function liriBot(search, term) {
    if (search === "concert-this") {
        term = term || "Weezer"
        findConcert(term);
    } else if (search === "spotify-this-song") {
        term = term || "ace of base"
        findMusic(term)
    } else if (search === "movie-this") {
        if (!term) {
            term = "Mr. Nobody";
        }
        findMovie(term);
    } else if (search === "do-what-it-says") {
        console.log("do what is says");
        randomTxt()
    } else {
        console.log("\nnot a valad input\nYou can use the following commands:\n\n*movie-this\n*spotify-this-song\n*concert-this\n*do-what-it-says");
    }
}

liriBot(search, term);