/**
 * jspsych-transition-training
 *
 * plugin for the change-point memory task
 *
 *
 **/

(function($) {
	jsPsych["transition-training"] = (function() {

		var plugin = {};
		
		//Define global variables for display
		var totalScore = 0;
		var rewOutcome = 0;
		
		
		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices', 'data']);

			var trials = new Array(params.stimuli.length);
			for (var i = 0; i < trials.length; i++) {
				trials[i] = {};
				trials[i].a_path = params.images_path[i];
				trials[i].choices = params.choices[i];
				trials[i].choiceKey = params.choiceKey;

				
				// outcome, directions, and correct action

				trials[i].outcome = params.outcome[i];
				trials[i].prompt = params.prompt[i];
				trials[i].correctResponse = params.correctResponse[i];

				
				// option to show image for fixed time interval, ignoring key responses
				//      true = image will keep displaying after response
				//      false = trial will immediately advance when response is recorded
				trials[i].continue_after_response = (typeof params.continue_after_response === 'undefined') ? true : params.continue_after_response;
				
				// timing parameters
				trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
				
				// optional parameters
				trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
				trials[i].show_score = params.show_score;
				
				//
				trials[i].trialType = params.trialType[i];
                trials[i].stimulus = params.stimuli[i];
                trials[i].context = params.contexts[i];
			}
			return trials;
		};


		plugin.trial = function(display_element, trial) {
			
			// clear the display
			display_element.html('');
			
			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			trial = jsPsych.pluginAPI.normalizeTrialVariables(trial);

			// display fixation cross
			display_element.append($('<div>', {
				"class": 'jspsych-centered-text',
				html: "+",
			}));
			
			reward = 0;
			// Display the value for 2 seconds, show blank screen for 0.5 s, then proceed with the trial.
			setTimeout(function() {
				
				display_element.html('');
				
				setTimeout(function() {
				
					// this array holds handlers from setTimeout calls
					// that need to be cleared if the trial ends early
					var setTimeoutHandlers = [];
					
					// display stimulus
					if (!trial.is_html) {
						display_element.append($('<img>', {
							src: trial.a_path,
							class: 'jspsych-single-stim-stimulus'
						}));
					} else {
						display_element.append($('<div>', {
							html: trial.a_path,
							id: 'jspsych-single-stim-stimulus'
						}));
					}

					//show prompt if there is one
					if (trial.prompt !== "") {
						display_element.append(trial.prompt);
					}
					
					// store response
					var response = {rt: -1, key: -1};
					
					// function to end trial when it is time
					var end_trial = function() {

						// kill any remaining setTimeout handlers
						for (var i = 0; i < setTimeoutHandlers.length; i++) {
							clearTimeout(setTimeoutHandlers[i]);
						}

						// kill keyboard listeners
						jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

						// gather the data to store for the trial
						var trial_data = {
							"rt": response.rt,
							"stimulus": trial.stimulus,
							"context": trial.context,
                            "imagefile": trial.a_path,
							"key_press": key_press,
							"response": responseID,
							"outcome": trial.outcome,
							"trialType": trial.trialType,
						};

						jsPsych.data.write($.extend({}, trial_data, trial.data));

						// clear the display
						display_element.html('');

						// move on to the next trial
						setTimeout(function() {
							displayFeedback();
						}, 0); // time between s and s'
					};

					// Did the subject choose to play?
					var play = 1; 
					
					// what was the trial outcome?
					var outcome =[];
					
					
					// Did the subject press a key?
					var keyIsPressed = 0;
					var responseID = -1;
					var correctResponse = 0;
					
					// function to handle responses by the subject
					var after_response = function(info) {

						display_element.html('');

						// record the subject's response (will not vary)
						responseID = trial.choiceKey[info.key];
						key_press = info.key;
						
						// only record the first response
						if(response.key == -1){
							response = info;
						}	
                            
						// end the trial
						end_trial();
														

					};

					
					// start the response listener
					var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse(after_response, trial.choices);

					// hide image if timing is set 
					if (trial.timing_stim > 0) {
						var t1 = setTimeout(function() {
							$('#jspsych-single-stim-stimulus').css('visibility', 'hidden');
						}, trial.timing_stim);
						setTimeoutHandlers.push(t1);
					}

					
					
					// Show feedback
					function displayFeedback(reward) {
						
						display_element.html(''); // remove all
						
						// Show the trial's outcome
						display_element.append($('<img>', {
							src: trial.outcome,
							class: 'jspsych-single-stim-stimulus'
						}));
							
						

						setTimeout(function() {
							
							display_element.html('');
							
							// Don't show score (Feedback, blank, end trial)
							setTimeout(function() {
								jsPsych.finishTrial();
							}, 250);
							
						}, 2000);	// How long to display feedback
					}

					
				}, 250); // how long to show blank screen between fixation and trial??
			}, 2000);	// How long to display fixation cross
		
		};

		return plugin;
	})();
})(jQuery);
