/**
 * jspsych-cpm
 *
 * plugin for the change-point memory task
 *
 *
 **/

(function($) {
	jsPsych["cpm-practice"] = (function() {

		var plugin = {};

		plugin.create = function(params) {

			params = jsPsych.pluginAPI.enforceArray(params, ['stimuli', 'choices', 'data']);

			var trials = new Array(params.stimuli.length);
			for (var i = 0; i < trials.length; i++) {
				trials[i] = {};
				trials[i].a_path = params.stimuli[i];
				trials[i].choices = params.choices;
				// option to show image for fixed time interval, ignoring key responses
				//      true = image will keep displaying after response
				//      false = trial will immediately advance when response is recorded
				trials[i].continue_after_response = (typeof params.continue_after_response === 'undefined') ? true : params.continue_after_response;
				// timing parameters
				trials[i].timing_stim = params.timing_stim || -1; // if -1, then show indefinitely
				trials[i].timing_response = params.timing_response || -1; // if -1, then wait for response forever
				// optional parameters
				trials[i].is_html = (typeof params.is_html === 'undefined') ? false : params.is_html;
				trials[i].prompt = (typeof params.prompt === 'undefined') ? "" : params.prompt;
				trials[i].value = params.value[i];
				trials[i].reward = params.reward[i][0];
				trials[i].prob = params.prob[i][0];
				trials[i].show_score = params.show_score;
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

			// display value
			display_element.append($('<div>', {
				"class": 'jspsych-centered-text',
				html: trial.value,
			}));
			
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
							"stimulus": trial.a_path,
							"play": play,
							"reward": trial.reward,
							"value": trial.value,
							"probability": trial.prob,
						};

						jsPsych.data.write($.extend({}, trial_data, trial.data));

						// clear the display
						display_element.html('');

						// move on to the next trial
						setTimeout(function() {
							displayFeedback();
						}, 500);
					};

					// Did the subject choose to play?
					var play = 0;
					
					// Did the subject press a key?
					var keyIsPressed = 0;
					
					// function to handle responses by the subject
					var after_response = function(info) {

						display_element.html('');
						
						if (info.key == 49) {
							display_element.append($('<img>', {
								src: trial.a_path,
								class: 'jspsych-image-border-play'
							}));
							play = 1;
							keyIsPressed = 1;
						}
						else if (info.key == 48) {
							display_element.append($('<img>', {
								src: trial.a_path,
								class: 'jspsych-image-border-pass'
							}));
							keyIsPressed = 1;
						}
						
						// only record the first response
						if(response.key == -1){
							response = info;
						}

						if (trial.continue_after_response) {
							// response triggers the next trial in this case.
							// if hide_image_after_response is true, then next
							// trial should be triggered by timeout function below.
							end_trial();
						} 
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

					// end trial if time limit is set
					if (trial.timing_response > 0) {
						var t2 = setTimeout(function() {
							end_trial();
						}, trial.timing_response);
						setTimeoutHandlers.push(t2);
					}
					
					// Show feedback
					function displayFeedback(reward) {
						
						display_element.html(''); // remove all
						
						// If the subject didn't press the correct key, tell them
						if (play == 0 && keyIsPressed == 0) {
							display_element.append($('<div>', {
								"class": 'jspsych-single-stim-feedback-tooslow',
								html: "<p>Respond Faster</p>",
							}));
						}
						// If the subject played and this trial is rewarded, show the value.
						else if (play == 1 && trial.reward == 1) {
							display_element.append($('<div>', {
								"class": 'jspsych-single-stim-feedback-correct',
								html: "+" + trial.value
							}));
						}
						// If the subject played and this trial is not rewarded, show -10.
						else if (play == 1 && trial.reward == 0) {
							display_element.append($('<div>', {
								"class": 'jspsych-single-stim-feedback-incorrect',
								html: "-10",
							}));
						}
						// If the subject chose pass, show the outcome in grey
						else if (play == 0 && trial.reward == 1) {
							display_element.append($('<div>', {
								html: '<p class="jspsych-centered-text">+0</p>' + 
								'<p class="jspsych-single-stim-feedback-neutral">(+' + trial.value + ')</p>'
							}));
						}
						else if (play == 0 && trial.reward == 0) {
							display_element.append($('<div>', {
								html: '<p class="jspsych-centered-text">+0</p>' + 
								'<p class="jspsych-single-stim-feedback-neutral">(-10)</p>'
							}));
						}

						setTimeout(function() {
							
							display_element.html('');
							
							// Show score (Feedback, blank, score, blank, end trial)
							if (trial.show_score) {
								setTimeout(function() {
									var current_score = jsPsych.data.getCurrentScore(true);
									display_element.append($('<div>', {
										"class": 'jspsych-single-stim-feedback-score',
										html: "Your Score: " + current_score,
									}));
									setTimeout(function() {
										display_element.html('');
										setTimeout(function() {
											jsPsych.finishTrial();
										}, 500);
									}, 1000);	// How long to display score
								}, 500);
							}
							// Don't show score (Feedback, blank, end trial)
							else {
								setTimeout(function() {
									jsPsych.finishTrial();
								}, 500);
							}
						}, 2000);	// How long to display feedback
					}
				}, 500);
			}, 2000);	// How long to display value
		
		};

		return plugin;
	})();
})(jQuery);
