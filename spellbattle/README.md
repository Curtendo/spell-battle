# Spell Battle
#### Video Demo:  https://youtu.be/evuh695miqk
#### Description:
To be used with Japanese students learning English as a spelling game.  Words will be sourced from their New Horizon Textbooks, or input manually by the user.

Overall game logic:
	•	Rules can be selected by the user
	•	Words allowed in the game
		•	Textbook words, where the word will be chosen randomly based on the settings.
			•	From *, where the user can select a specific textbook and unit/lesson.
			•	Up to *, where the user can select a specific textbook and unit/lesson.
			•	Only *, where the user selects only specific textbook units/lessons.
		•	Custom words, where the user can type one word or a list of words into a text field
		•	Word length
			•	From *, where the user can select the minimum word length.
			•	Up to *, where the user can select the maximum word length.  Max word length is determined by words selected in the textbook and unit.
			•	Using these variables on a slider, the user can choose from all word lengths possible (default) to only one word length.

	•	Game board
	•		The game board is shown at the start of the game.  One empty square for each letter, depending on the word length, is shown.  Two rows of empty squares are shown, and the board scrolls down as gameplay goes on and more rows are generated.

	•	Game play
		•	Player(s) have 10 attempts to correctly guess the word.
		•	Player(s) type in their guess with a keyboard or click the onscreen keyboard and push a return button.
		•	Player(s) guess is checked for a correct guess.  If incorrect, it’s checked against a dictionary.
		•	A checker changes each letter (or letter background)’s color as follows:
			•	Correct letter in the correct position of word: green
			•	Correct letter in an incorrect position of word: yellow
			•	Letter not in word: no highlight
		•	Repeat attempts until the attempt equals the answer or the user is out of tries.

	•	Points
		•	Correctly guessing the word awards the player with 10 points times the amount of tries remaining.
		•	If the player answers on the first try (10 tries remaining), they are awarded 100 points.  If five tries are remaining, they receive 50 points, etc.

	•	Spelling
	•		Because it’s an educational game, the player should be prompted if the word is misspelled (doesn’t exist in the English dictionary). There is no penalty for misspelling and the player can try again.

	•	Answer reveal
	•		When the answer is revealed, either by being guessed correctly or after 10 incorrect guesses, the word is shown on screen with its Japanese translation.