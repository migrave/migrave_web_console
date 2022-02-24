// var url = prompt("Please enter QTrobot rosbridge url:", "ws://192.168.1.106:9091");
var url = "ws://192.168.1.106:9091";
url = (url == "") ? 'ws://127.0.0.1:9091' : url;
var qtrobot = {};
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

qtrobot.subscribe("/migrave_data_recording/is_record", "std_msgs/Bool", function(m){
    document.getElementById("data_recorder").innerHTML = m.data;
})

// Data recorder
qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
    position = m.position;
    document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
});



// Head pose
function moveHead(action) {
    qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
        position = m.position;
        document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
        headPitch = position[0]
        headYaw = position[1]
    });
    if (action == "left"){
        headPitch = Math.min(headPitch + 5, 90);
    }
    if (action == "right"){
        headPitch = Math.max(headPitch - 5, -90)
    }
    if (action == "up"){
        headYaw = Math.max(headYaw - 5, -15)
    }
    if (action == "down"){
        headYaw  = Math.min(headYaw + 5, 25)
    }

    qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headPitch, headYaw]});
}


buttonLeft = document.getElementById("left");
buttonLeft.addEventListener("click", function(){
    moveHead("left");
});
buttonRight = document.getElementById("right");
buttonRight.addEventListener("click", function(){
    moveHead("right");
});
buttonUp = document.getElementById("up");
buttonUp.addEventListener("click", function(){
    moveHead("up");
});
buttonDown = document.getElementById("down");
buttonDown.addEventListener("click", function(){
    moveHead("down");
});

sliderHeadPitch = document.getElementById("head_pitch");
sliderHeadYaw = document.getElementById("head_yaw");
sliderHeadPitch.addEventListener("input", function()
    {
        headPitch = Number(sliderHeadPitch.value);
        headYaw = Number(sliderHeadYaw.value);
        qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headYaw, headPitch]});
        console.log("Move head")
        console.log("Pitch: " + headPitch)
    }
)

sliderHeadYaw.addEventListener("input", function()
    {
        headPitch = Number(sliderHeadPitch.value);
        headYaw = Number(sliderHeadYaw.value);
        qtrobot.publish(topicHead, "std_msgs/Float64MultiArray", {data: [headYaw, headPitch]});
        console.log("Move head")
        console.log("Yaw: " + headYaw)
    }
)


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


qtrobot.subscribe(topicJointState, "sensor_msgs/JointState", function(m){
    position = m.position;
    document.getElementById("position").innerHTML = [position[0].toFixed(2), position[1].toFixed(2)];
    console.log("update jointstate")
}, true);


qtrobot.subscribe(topicEmotionGameStatus, "std_msgs/String", function(m){
    position = m.position;
    document.getElementById("game_status").innerHTML = m.data;
    console.log("update game status")
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




