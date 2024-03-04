# Spell Battle
#### Video Demo:  https://youtu.be/evuh695miqk
#### Description:
To be used with Japanese students learning English as a spelling game.  Words will be sourced from their New Horizon Textbooks, or input manually by the user.

Overall game logic:

	•	Words allowed in the game
		•	Textbook words, where the word will be chosen randomly based on the user settings.
			•	From *, where the user can select a specific textbook and unit/lesson.
			•	To *, where the user can select a specific textbook and unit/lesson.
		•	Custom words, where the user can type one word or a list of words into a text field
  
	•	Word length
		•	Using a slider, the user can select the minimum and maximum word length they want the random word to contain.  
  		•	Min and max values are based off of the available words:
    			•	For textbook words, the words between the From and To selections.
       			•	For custom words, the min and max length of the words input by user.
	  
	•	Game board
		•	The game board is shown at the start of the game.  
  			One row, with one empty square for each letter, depending on the word length, is shown.  
 		•	A second row, empty and muted in color, is displayed below the active row, 
   			showing the game will continue after guessing.

	•	Game play
		•	Player has 10 attempts to correctly guess the word.
		•	Player types in their guess with a keyboard or click the onscreen keyboard and push a return button.
		•	Player's guess is checked for a correct guess.  
  			If incorrect, it’s checked against a dictionary for valid word and spelling.
  			•	If incorrect spelling or not a valid word, squares flash red and player can try again without penalty.
		•	A checker changes each letter's background color as follows:
			•	Correct letter in the correct position of word: green
			•	Correct letter in an incorrect position of word: yellow
			•	Letter not in word: no highlight
   				•	On-screen keyboard's key is then grayed out.
		•	Repeat attempts until the attempt equals the answer or the user is out of tries.

	•	Points
		•	Points equals number of letters times tries remaining.  
  			For example, a 5-letter word guessed on the first try (10 attempts remaining) will award 50 points.
     		A 5-letter word guessed with 4 attempts remaining will award 20 points.

	•	Spelling
		•	Because it’s an educational game, the player will be prompted if the word is misspelled (doesn’t exist in the English dictionary). 
 			There is no penalty for misspelling and the player can try again.

	•	Answer reveal
		•	When the answer is revealed, either by being guessed correctly or after 10 incorrect guesses, the word is shown on screen.
  		•	If textbook word:
			•	Word, Japanese translation, part of speech, textbook, unit, lesson, and page number are shown.
		•	If custom word:
  			•	Only word is shown.
     	•	Points (game points as well as total accumulated points) are also shown here.
 		
