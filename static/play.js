let tries = 10;
let score = 100;
let currentTile;
let currentRow;
let isGameOver = false; // For disabling handleEnter function

function resetTries() {
    tries = 10;
    $('#tries-value').text(tries);
}

function decreaseTries() {
    tries -= 1;
    $('#tries-value').text(tries);
}

function resetScore() {
    score = 100;
    $('#score-value').text(score);
}

function decreaseScore(amount) {
    score -= amount;
    $('#score-value').text(score);
}

function generateTileRow(length) {
    let tileWidth = 50;
    let tileHeight = 50;
    let fontSize = '1em';
    let tileMargin = '3px';
    let viewportWidth = $(window).width();

    if (viewportWidth < 480) {
        if(length > 9 && length < 12) {
            tileWidth = 30;
            tileHeight = 35;
            fontSize = '0.8em';
            tileMargin = '2px';
        }
        else if(length >= 12 ) {
            tileWidth = 24;
            tileHeight = 30;
            fontSize = '0.7em';
            tileMargin = '2px';
        }
    }

    // Set the number of grid columns based on word length
    $('#game-board').css({'grid-template-columns': `repeat(${length}, ${tileWidth}px)`});

    currentRow = $('<div>').addClass('tile-row active-row');

    for(let i = 0; i < length; i++) {
        let tile = $('<div>')
            .addClass('tile')
            .css({
                'width': tileWidth + 'px',
                'height': tileHeight + 'px',
                'font-size': fontSize,
                'margin': tileMargin
            })
            .attr('data-state', 'empty')
            .text('');
            currentRow.append(tile);
        }

    $('#game-board').append(currentRow);

    if (tries > 1) {
        let faintRow = currentRow.clone().removeClass('active-row').addClass('faint');
        $('#game-board').append(faintRow);
    }

}

function applyAnimationDelays(rowElem) {
    $(rowElem).find('.tile').each(function(tileIndex, tileElem) {
        let delay = tileIndex * 200;
        $(tileElem).css('animation-delay', `${delay}ms`);
    });
}

function triggerTileAnimations() {
    $('.active-row .tile').attr('data-animation', 'flip');
}

function resetTileAnimations() {
    $('.active-row .tile').removeAttr('data-animation');
}

function moveAndGenerateRow() {
    currentRow.removeClass('active-row');
    currentRow = currentRow.next('.tile-row');
    currentRow.removeClass('faint').addClass('active-row');
    currentTile.removeClass('active-tile');

    if (tries > 1) {
        let faintRow = currentRow.clone().removeClass('active-row').addClass('faint');
        $('#game-board').append(faintRow);
    }

    currentTile = currentRow.find('.tile:first-child').addClass('active-tile');
}

function scrollToLatestRow() {
    const gameBoard = $('#game-board');
    const latestRow = gameBoard.find('.tile-row').last();
    if (latestRow.length) {
        gameBoard.animate({
            scrollTop: gameBoard.scrollTop() + latestRow.position().top
        }, 'slow');
    }
}


const keyboardLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['⬅', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '↵'],
];

function generateVirtualKeyboard() {
    keyboardLayout.forEach(row => {
        let rowDiv = $('<div>').addClass('keyboard-row');
        row.forEach(key => {
            let button = $('<button>')
                .attr('type', 'button')
                .attr('data-key', key)
                .addClass('keyboard-key')
                .text(key);
            if (key === '↵' || key === '⬅') {
                button.addClass('keyboard-key-large');
            }
            rowDiv.append(button);
        });
        $('#virtual-keyboard').append(rowDiv);
    });
}

function updateTileAndMoveFocus(letter) {
    currentTile.text(letter);
    // If active-tile is not on last tile, focus to the next tile
    if (!currentTile.is(':last-child')) {
        currentTile.removeClass('active-tile');
        currentTile = currentTile.next('.tile'); // Re-assigning global variable
        currentTile.addClass('active-tile');
    }
}

function updateTileColors(selector, attempt) {
    $(selector).each(function(index, element) {
        let delay = index * 200 + 250;
        setTimeout(function() {
            if (attempt[index].green) {
                $(element).css('background-color', '#198754');
            } else if (attempt[index].yellow) {
                $(element).css('background-color', '#B8860B');
            }
        }, delay);
    });
}


function updateKeyColors(selector, attempt) {
    $(attempt).each(function(index, item) {
        let delay = index * 200;

        setTimeout(function() {
            let char = item.letter;
            let keySelector = selector + '[data-key="' + char + '"]';

            if (item.green) {
                $(keySelector).css('background-color', '#198754');
            } else if (item.yellow && $(keySelector).css('background-color') !== 'rgb(25, 135, 84)') {
                $(keySelector).css('background-color', '#B8860B');
            } else if ($(keySelector).css('background-color') !== 'rgb(25, 135, 84)' && $(keySelector).css('background-color') !== 'rgb(184, 134, 11') {
                // Darken that key
                $(keySelector).css('background-color', '#555555');
            }
        }, delay);
    });
}

function handleBackspace() {
    // Clear the last tile if letter is populated
    if (currentTile.is(':last-child') && (currentTile.text() !== '')) {
        currentTile.text('');
    }
    // Clear the previous tile's content and move active state to prev tile
    else if (!currentTile.is(':first-child')) {
        currentTile.removeClass('active-tile');
        currentTile = currentTile.prev('.tile'); // Re-assigning global variable
        currentTile.addClass('active-tile').text('');
    }
}

function displayGameOverModal(win, txbBool, wordDetailsOrAnswer, score, totalScore) {
    currentTile.removeClass('active-tile');
    isGameOver = true;

    if (win) {
        $("#game-over-title").text("You win! ◝(⁰▿⁰)◜");
    } else {
        $("#game-over-title").text("Good try!  (⋟﹏⋞)");
    }

    let wordContent = "";
    if (txbBool) {
        wordContent += `<h3>- ${wordDetailsOrAnswer.word} -</h3>`;
        wordContent += `<div class="divider-transparent"></div>`;
        wordContent += `<div>${wordDetailsOrAnswer.pos}</div>`;
        wordContent += `<div>${wordDetailsOrAnswer.meaning}</div>`;
        wordContent += `<div class="divider-transparent"></div>`;
        wordContent += `<div>New Horizon ${wordDetailsOrAnswer.grade}, Unit ${wordDetailsOrAnswer.unit}</div>`;
        wordContent += `<div></div>`;
        wordContent += `<div>${wordDetailsOrAnswer.lesson}</div>`;
        wordContent += `<div>Page ${wordDetailsOrAnswer.page}</div>`;
    } else {
        wordContent = `<div>${wordDetailsOrAnswer}</div>`;
    }
    $("#word-details").html(wordContent);
    $("#game-score").text("Game score: " + score);
    $("#total-score").text("Total score: " + totalScore);

    delay = wordLength * 200 + 500
    setTimeout(function() {
        $("#game-over-modal").show();
    }, delay);
}

// Handle "Play again" button click
$("#play-again").click(function(event) {
    event.preventDefault(); // prevent the default form submission
    let targetURL = txb_bool ? '/pull_textbook_word' : '/pull_custom_word';
    $("#playAgainForm").attr("action", targetURL);
    $("#playAgainForm").submit();
});

// Handle "Change Settings" button click
$("#change-settings").click(function() {
    $("#changeSettingsForm").submit();
});

function handleEnter() {
    if (isGameOver) {
        return;
    }
    // Check if active tile is on last tile and is not empty.
    if (currentTile.is(':last-child') && (currentTile.text() !== '')) {
        // Collect letters in tiles and join in a string
        let attempt = "";
        attempt = currentRow.find('.tile').map(function() {
            return $(this).text();
        }).get().join('');

        console.log("attempt", attempt);

        // Send to be checked
        $.ajax({
            url: '/word_check',
            method: 'POST',
            data: {
                'attempt': attempt,
                'gameScore': score,
                'tries': tries
            },
            dataType: 'json',
            success: function(response) {
                switch (response.status) {
                    case "winGame":
                        console.log('winGame response received');
                        attemptDict = response.attempt;
                        applyAnimationDelays(currentRow);
                        triggerTileAnimations();
                        updateTileColors('.active-row .tile', attemptDict);
                        updateKeyColors('.keyboard-key', attemptDict);
                        $('.active-row .tile').last().one('animationend', function() {
                            resetTileAnimations(currentRow);
                        });
                        totalScore = response.totalScore;


                        if (txb_bool) {
                            // Display window with message: "You win!", word_details, score, and totalScore.
                            // displayGameOverModal(win, txbBool, wordDetailsOrAnswer, score, totalScore)
                            word_details = response.word_details;
                            displayGameOverModal(true, txb_bool, word_details, score, totalScore);
                        }
                        else {
                            // Display window with message: "You win!", word_answer, score, and totalScore.
                            word_answer = response.word_answer;
                            displayGameOverModal(true, txb_bool, word_answer, score, totalScore);
                        }
                        break;
                    case "misspell":
                        // Letters flash red
                        $('.active-row .tile').css('color', 'red');

                        setTimeout(function() {
                            // Add the .5s "fade-out" class and revert border color
                            $('.active-row .tile').addClass('fade-out').css('color', '');

                            // After the transition out is completed, remove the "fade-out" class to revert to original transition timing
                            setTimeout(function() {
                                $('.active-row .tile').removeClass('fade-out');
                            }, 500);  // Duration for the slow transition out

                        }, 250); // Duration for the flash on
                        break;
                    case "update":
                        console.log('update response received');
                        // Handle tile and score update
                        attemptDict = response.attempt;

                        // Update colors for tiles and keyboard keys based on attempt list
                        applyAnimationDelays(currentRow);
                        triggerTileAnimations();
                        updateTileColors('.active-row .tile', attemptDict);
                        updateKeyColors('.keyboard-key', attemptDict);
                        $('.active-row .tile').last().one('animationend', function() {
                            resetTileAnimations(currentRow);
                        });

                        decreaseTries();
                        decreaseScore(10);

                        if (tries == 0) {
                            totalScore = response.totalScore;
                            if (txb_bool) {
                                // Display window with message: "Good try!", word_details, score, and totalScore.
                                // displayGameOverModal(win, txbBool, wordDetailsOrAnswer, score, totalScore)
                                word_details = response.word_details;
                                displayGameOverModal(false, txb_bool, word_details, score, totalScore);
                            }
                            else {
                                // Display window with message: "Good try!", word_answer, score, and totalScore.
                                word_answer = response.word_answer;
                                displayGameOverModal(false, txb_bool, word_answer, score, totalScore);
                            }
                        }

                        moveAndGenerateRow();
                        scrollToLatestRow();
                        break;
                }
            },
            error: function() {
                console.error("There was an issue communicating with the server.");
            }
        });
    }
    // Tile borders flash red
    else {
        $('.active-row .tile').css('border-color', 'red');

        setTimeout(function() {
            // Add the .5s "fade-out" class and revert border color
            $('.active-row .tile').addClass('fade-out').css('border-color', '');

            // After the transition out is completed, remove the "slow-transition" class to revert to original transition timing
            setTimeout(function() {
                $('.active-row .tile').removeClass('fade-out');
            }, 500);  // Duration for the slow transition out

        }, 250); // Duration for the flash on
    }
}

// Build tiles and keyboard
$(document).ready(function() {
    generateTileRow(wordLength);
    generateVirtualKeyboard();
    resetScore();
    resetTries();

    // Initially, set the first tile as active
    currentTile = $('.tile-row:first-child .tile:first-child').addClass('active-tile');

    $(document).on('keydown', function(e) {
        let keyCode = e.which;
        let letter;

        switch (keyCode) {
            case 8: // Backspace key
                handleBackspace();
                e.preventDefault(); // Prevent default browser behavior
                break;
            case 13: // Enter key
                handleEnter();
                e.preventDefault(); // Prevent default browser behavior
                break;
            default:
                letter = String.fromCharCode(keyCode).toUpperCase();
                if (/[A-Z]/.test(letter)) { // Make sure it's a letter
                    updateTileAndMoveFocus(letter);
                }
                break;
        }
    });

    $('.keyboard-key').on('click', function() {
        let letter = $(this).text();
        if (letter === '⬅') {
            handleBackspace();
        }
        else if (letter === '↵') {
            handleEnter();
        }
        else {
            updateTileAndMoveFocus(letter);
        }
    });
});

