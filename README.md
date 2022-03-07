# migrave web console
Repository of web console for the MigrAVE project

## Dependences

- web_video_server
- rosbridge_suite
- realsense-ros
- migrave_ros_msgs
- migrave_games

## Usage

1. Launch the rosbridge node
    ```sh
    roslaunch migrave_web_console qt_rosbridge_websocket.launch
    ```
    Currently, rosbridge started automatically in IXP QTrobot. 

2. Open the `index.html` file with the browser. 

## Screenshot

This is how the web console looks like.
![screenshot](./assets/img/MigrAVE_web_console.png "opt title")
