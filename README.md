# Psiturk-Feedback-Learning-with-Contexts
Contains the logic to run a reward feedback-based learning using psiturk

## Setup
### Files to Modify:
* *config.txt*: The configuration file for psiturk *N.B.* there are several variables to edit in this file
  * *config\_local.txt*, *config\_live.txt*: it is convenient to maintain a "live" and a "local" version of the configuration file, to switch between when debugging.
  * The main difference between the the *live* and *local* versions is database\_url option. In the local version this is set to a SQLite data base (the default is sqlite:///participants.db) while the *live* version of the file is typically configured with a MySQL database. See the [psiturk documentation](http://psiturk.readthedocs.org/en/latest/configure_databases.html) for more details.
  
* *temp.psiturkconfig*: This file will need to be moved to ~/.psiturkconfig with your AMT credentials (See [psiturk documentation](http://psiturk.readthedocs.org/en/latest/amt_setup.html) for more details.)

* */templates/ad.html*: Adjust this to advertise your task and explicitly tell the subject how much you will pay them, etc.

* */templates/consent.html*: Your online consent form will go here.



### Configuration files needed:
* *static/game#.json*: these are static files that contain predrawn outcomes that control the stimuli and outcomes the subject sees.  By Default, exp.html looks for 10 of these files
format:     
json file with object: *trials*, *rewards*, *trial\_type*
  * *trials*: The value of *trials* is an object where the name is a _string_ with the trial number (starting with "0") and the value is array that contains the stimulus, context pair as [*S*, *C*], where 
  *S* is the (integer) stimulus number and *C* is the (integer) context number (both indexes start with 0)
  
  for example: the name: value pair  
    
  "23": [0,1]  
  
  would indicate that on the 24th trials, stimulus 0 and context 1 would be shown
  
  * *rewards*: The value of *rewards* is an object where the name is a *string* with the trial number (starting with "0") and the vaue is an object that contains the response number as a string for the names, and a 0 or 1 for the pre-drawn reward for that action.
  
  for example: the name: value pair 
  
  "23": {"0": 0, "1": 0, "2": 1, "3": 0} 
  
  would indicate that on the 24th trials, action "2" would be rewarded
  
  * *trial\_type*: The value of *trial\_type* is an array of strings that indicate the type of the trial for each position in the array (either "test" or "train")
  
  for example:
  
  ["train","train","test", (...) ] 
  
  
 
* *static/images/S#_C#.png*: these are static images that are the stimuli. *Note!* The experiment assumes there are 4 stimuli and 4 contexts (this can be changed in exp.html) (Also, colored shapes are included in this version)

## Images needed:
* /static/favicon.ico -- a favicon file
* /static/images/university.png -- logo for the university (displayed in the add and consent form)

## Editing the experiment
You will need to edit the experiment file */templates/exp.html* to include your instructions. There may be other edits you wish to make:

* To change the value of wins/lose: *templates/exp.html* change *var valueMat = [1, 0]* to *var valueMat = [W ,L]*, where *W* is the point value for correct response and *L* is the point value for incorrect responses.
* *max\_response\_time*: Set in ms, (-1 for no limit)
* feedback_display_time: 2000,
* timing_between_response_and_feedback: 0,
* timing_iti: 750,
* timing\_max\_response\_time: 750,