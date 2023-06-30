//var url = prompt("Please enter QTrobot rosbridge url:", "ws://192.168.100.2:9091");
var url = "ws://192.168.100.2:9091";
url = (url == "") ? 'ws://127.0.0.1:9091' : url;
var qtrobot = {};
var robotName = "qtrobot";
var buttonHome = {};
var buttonLeft = {};
var buttonRight = {};
var buttonUp = {};
var buttonDown = {};
var topicJointState = "/qt_robot/joints/state";
var stateJoints = [];
var position = [];
var headPitch = 0;
var headYaw = 0;
var action = "";
var topicHead = "/qt_robot/head_position/command";
var topicEmotionGameStatus = "/migrave_game_emotions/status"
var topicImitationGameStatus = "/migrave_game_imitation/status"
var topicGamePerformance = "/migrave/game_performance"

document.addEventListener('DOMContentLoaded', function () {
    console.log("connecting to QTrobot (please wait...)");
    qtrobot = new QTrobot({
        url : url,
        connection: function(){
            console.log("connected to " + url);
            //qtrobot.talk_text('Hello! my name is QT!', function(){
            //    qtrobot.show_emotion('QT/happy');
            //});
        },
        error: function(error){
            console.log(error);
        },
        close: function(){
            console.log("disconnected.");
        }
    }); //end of qtrobot

}); // end of DOMContentLoaded

// Status
qtrobot = new QTrobot({
    url : url,
    connection: function(){
        console.log("connected to " + url);
        document.getElementById("status").innerHTML = "connected";
    },
    error: function(error){
        console.log(error);
        document.getElementById("status").innerHTML = "error";
    },
    close: function(){
        console.log("disconnected.");
        document.getElementById("status").innerHTML = "disconnected";
    }
});

buttonConfirm = document.getElementById("confirm");
buttonConfirm.addEventListener("click", function()
    {
        var valueParticipantID = document.getElementById("inputID").value
        var valueName = document.getElementById("inputName").value
        var valueAge = document.getElementById("inputAge").value
        var valueGenderMale = document.getElementById("male").checked
        var valueGenderFemale = document.getElementById("female").checked
        var valueGenderOther = document.getElementById("other").checked
        var valueGender = ""
        var valueMotherTongue = document.getElementById("inputMotherTongue").value

        // find gender
        if(valueGenderMale == true)
        {
            valueGender = "male";
        }
        if(valueGenderFemale == true)
        {
            valueGender = "female";
        }
        if(valueGenderOther == true)
        {
            valueGender = "other";
        }

        // set age default to -1 (unknown)
        if(valueAge == "")
        {
            valueAge = -1
        }

        var gamePerformance =
            {
                stamp:
                {
                    // Date.now() 13 digits (first 10 -> secs)
                    // secs: 10 digits
                    // nsecs: 9 digits
                    secs: Math.floor(Date.now()/1000),
                    nsecs: (Date.now()%1000)*1000000,
                },
                person:
                {
                    id: valueParticipantID,
                    name: valueName,
                    age: parseInt(valueAge),  // has to be int
                    gender: valueGender,
                    mother_tongue: valueMotherTongue,
                },
                game_activity:
                {
                    game_id: "",
                    game_activity_id: "",
                    difficulty_level: 0,
                },
                answer_correctness: -1,
            };
        console.log("receive participant info")
        qtrobot.publish(topicGamePerformance, "migrave_ros_msgs/GamePerformance", gamePerformance);
        qtrobot.talk_text("Information received. Let's start!", function(){
            qtrobot.show_emotion('QT/happy');
        });
    }
)

// Data recorder
qtrobot.subscribe("/migrave_data_recording/is_record", "std_msgs/Bool", function(m){
    if (m.data == true)
    {
        document.getElementById("data_recorder").innerHTML = "recording";
    } else {
        document.getElementById("data_recorder").innerHTML = "not recording";
    }
})

// Head position
qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
    position = m.position;
    document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
});


// Head pose
//function moveHead(action) {
//    qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
//        position = m.position;
//        document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
//        headPitch = position[0]
//        headYaw = position[1]
//    });
//    if (action == "left"){
//        headPitch = Math.min(headPitch + 5, 90);
//    }
//    if (action == "right"){
//        headPitch = Math.max(headPitch - 5, -90)
//    }
//    if (action == "up"){
//        headYaw = Math.max(headYaw - 5, -15)
//    }
//    if (action == "down"){
//        headYaw  = Math.min(headYaw + 5, 25)
//    }
//
//    qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headPitch, headYaw]});
//}
//
//
//buttonLeft = document.getElementById("left");
//buttonLeft.addEventListener("click", function(){
//    moveHead("left");
//});
//buttonRight = document.getElementById("right");
//buttonRight.addEventListener("click", function(){
//    moveHead("right");
//});
//buttonUp = document.getElementById("up");
//buttonUp.addEventListener("click", function(){
//    moveHead("up");
//});
//buttonDown = document.getElementById("down");
//buttonDown.addEventListener("click", function(){
//    moveHead("down");
//});

// Head pose control via two sliders
sliderHeadPitch = document.getElementById("head_pitch");
sliderHeadYaw = document.getElementById("head_yaw");
sliderHeadPitch.addEventListener("input", function()
    {
        headPitch = Number(sliderHeadPitch.value);
        headYaw = Number(sliderHeadYaw.value);
        qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headYaw, headPitch]});
        console.log("move head")
        console.log("Pitch: " + headPitch)
    }
)

sliderHeadYaw.addEventListener("input", function()
    {
        headPitch = Number(sliderHeadPitch.value);
        headYaw = Number(sliderHeadYaw.value);
        qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headYaw, headPitch]});
        console.log("move head")
        console.log("Yaw: " + headYaw)
    }
)

var buttonSelectRobot = document.getElementById("select_robot");
buttonSelectRobot.addEventListener("click", function(){
    robotName = $("#robot_name").val();
    if (robotName == "qtrobot") {
        $("#video_color").attr("src", "http://localhost:8080/stream?topic=/camera/color/image_raw");
    }
    else if (robotName == "nao") {
        $("#video_color").attr("src", "http://localhost:8080/stream?topic=/nao_camera/color/image_raw");
    }
}, false);

// Home
buttonHome = document.getElementById("home");
buttonHome.addEventListener("click", function(){
    qtrobot.home_motors();
    qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
        position = m.position;
        document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
    }, true);
    sliderHeadPitch.value = 0;
    sliderHeadYaw.value = 0;
}, false);


//qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
//    position = m.position;
//    document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
//    console.log("update jointstate")
//}, true);

// start recording
var buttonStartRecording = document.getElementById("start_recording");
buttonStartRecording.addEventListener("click", function(){
    if (robotName == "qtrobot") {
        qtrobot.publish("/migrave_data_recording/is_record", "std_msgs/Bool", {data: true});
        qtrobot.publish("/migrave_data_recording_nao/is_record", "std_msgs/Bool", {data: false});
    }
    else if (robotName == "nao") {
        qtrobot.publish("/migrave_data_recording_nao/is_record", "std_msgs/Bool", {data: true});
        qtrobot.publish("/migrave_data_recording/is_record", "std_msgs/Bool", {data: false});
    }
    console.log("start recording");
}, false);

// stop recording
var buttonStopRecording = document.getElementById("stop_recording");
buttonStopRecording.addEventListener("click", function(){
    qtrobot.publish("/migrave_data_recording/is_record", "std_msgs/Bool", {data: false});
    qtrobot.publish("/migrave_data_recording_nao/is_record", "std_msgs/Bool", {data: false});
    console.log("stop recording");
}, false);

// engagement estimation start
var buttonStartEngagementEstimation = document.getElementById("start_engagement_estimation");
buttonStartEngagementEstimation.addEventListener("click", function(){
    if (robotName == "qtrobot") {
        console.log("starting face feature detection for QTrobot");
        qtrobot.publish("/migrave_perception/openface_ros/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/openface_ros_ext_up/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/openface_ros_ext_down/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/nao_openface_ros/event_in", "std_msgs/String", {data: "e_stop"});
    }
    else if (robotName == "nao") {
        console.log("starting face feature detection for NAO");
        qtrobot.publish("/migrave_perception/nao_openface_ros/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/openface_ros_ext_up/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/openface_ros_ext_down/event_in", "std_msgs/String", {data: "e_start"});
        qtrobot.publish("/migrave_perception/openface_ros/event_in", "std_msgs/String", {data: "e_stop"});
    }

    console.log("starting engagement estimation");
    qtrobot.publish("/migrave_perception/person_state_merger/event_in", "std_msgs/String", {data: "e_start"});
    qtrobot.publish("/migrave_perception/person_state_estimator_rgbd/event_in", "std_msgs/String", {data: "e_start"});
    qtrobot.publish("/migrave_perception/person_state_estimator_ext_up/event_in", "std_msgs/String", {data: "e_start"});
    qtrobot.publish("/migrave_perception/person_state_estimator_ext_down/event_in", "std_msgs/String", {data: "e_start"});
}, false);

// engagement estimation stop
var buttonStopEngagementEstimation = document.getElementById("stop_engagement_estimation");
buttonStopEngagementEstimation.addEventListener("click", function(){
    console.log("stopping face feature detection");
    qtrobot.publish("/migrave_perception/openface_ros/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/openface_ros_ext_up/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/openface_ros_ext_down/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/nao_openface_ros/event_in", "std_msgs/String", {data: "e_stop"});

    console.log("stopping engagement estimation");
    qtrobot.publish("/migrave_perception/person_state_merger/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/person_state_estimator_rgbd/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/person_state_estimator_ext_up/event_in", "std_msgs/String", {data: "e_stop"});
    qtrobot.publish("/migrave_perception/person_state_estimator_ext_down/event_in", "std_msgs/String", {data: "e_stop"});
}, false);

// restart game
var buttonRestartGame = document.getElementById("restart_game");
buttonRestartGame.addEventListener("click", function(){
    var gameName = $("#game_name").val();
    if (gameName != "none") {
        qtrobot.publish("/migrave_games/restart", "std_msgs/String", {data: gameName});
        console.log("restarting game " + gameName);
    }
}, false);

// stop game
var buttonStopGame = document.getElementById("stop_game");
buttonStopGame.addEventListener("click", function(){
    var gameName = $("#game_name").val();
    if (gameName != "none") {
        qtrobot.publish("/migrave_games/stop", "std_msgs/String", {data: gameName});
        console.log("stopping game " + gameName);
    }
}, false);

// Game id
qtrobot.subscribe(topicGamePerformance, "migrave_ros_msgs/GamePerformance", function(m){
    document.getElementById("game_id").innerHTML = m.game_activity.game_id;
    console.log("update game id")
}, true);

// Game activity/task
// qtrobot.subscribe(topicGamePerformance, "migrave_ros_msgs/GamePerformance", function(m){
//     if(m.game_activity.game_activity_id == "")
//     {
//         document.getElementById("activity_id").innerHTML = "idle";
//     }else{
//         document.getElementById("activity_id").innerHTML = m.game_activity.game_activity_id;
//     }
//     console.log("update game activity id")
// }, true);

// Game status
qtrobot.subscribe(topicEmotionGameStatus, "std_msgs/String", function(m){
    document.getElementById("game_status").innerHTML = m.data;
    console.log("update game status")
}, true);

qtrobot.subscribe(topicImitationGameStatus, "std_msgs/String", function(m){
    document.getElementById("game_status").innerHTML = m.data;
    console.log("update game status")
}, true);

// Participant ID
qtrobot.subscribe(topicGamePerformance, "migrave_ros_msgs/GamePerformance", function(m){
    document.getElementById("participant_id").innerHTML = m.person.id;
    console.log("update participant id")
}, true);
// test
//var listener = new ROSLIB.Topic({
//    ros : qtrobot.ros,
//    name : topicEmotionGameStatus,
//    messageType : 'std_msgs/String'
//  });
//
//listener.subscribe(function(message) {
//    console.log('Received message on ' + listener.name + ': ' + message.data);
//  });




