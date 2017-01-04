// 2016.1.7
// 未來要強制使用者一定要加入投票名稱？
// 使用說明待加入.....懶....HJ

var qs = require('querystring');
var Firebase = require('firebase');
var ref = new Firebase('https://crackling-torch-7611.firebaseio.com');


exports.handler = function (event, context) {

    // parse slack command string sent via API gateway
    var params = qs.parse(event.body);
    var command = params.text;
    var userName = params.user_name;
    var splitCommand = command ? command.split(' ') : '';
    var commandOption = splitCommand[0] ? splitCommand[0] : command;
    var commandEvent = splitCommand[1] ? splitCommand[1] : 'Event';
    var displayText = '';

    var voterRef = ref.child(commandEvent);


    // displayText = commandOption;
    voterRef.once("value", function(snapshot) {

    // ref.update({poll: null});
    switch (commandOption) {
      case 'new':
        // voterRef.push({voter: userName});
        displayText = "開始投票囉! 投票項目： " + commandEvent;
        break;

      case '+1':
        voterRef.push({voter: userName});
        // displayText = "[ " + commandEvent + " ]  " + userName + " +1";
        displayText = {
          "response_type": "in_channel",
          "text": "[ " + commandEvent + " ]",
          "attachments": [
            {
              "text": userName + " +1"
            }
          ]
        };
        break;

      case '-1':
        snapshot.forEach(function(data) {
            var cNode = data.child('voter');
            if (cNode.val() == userName) {
              var deleteRef = voterRef.child(data.key());
              deleteRef.remove();
          }
        });
        // displayText = "[ " + commandEvent + " ]  " + userName + " -1";
        displayText = {
          "response_type": "in_channel",
          "text": "[ " + commandEvent + " ]",
          "attachments": [
            {
              "text": userName + " -1"
            }
          ]
        };
        break;

      case 'result':
          var resultText = '';
          var num = 0;
          snapshot.forEach(function(data) {
            var cNode = data.child('voter');
            resultText += "   " + cNode.val() + ", ";
            num = num+1;
          });
          var strNum = num.toString();
        displayText = {
          "response_type": "in_channel",
          "text": "[ " + commandEvent + " ] 投票結果",
          "attachments": [
            {
              "text": resultText + "  共 " + strNum + " 票"
            }
          ]
        };



        break;

      case 'help':
        // displayText = "使用說明還沒生出來.........";
        displayText = {
          "response_type": "in_channel",
          "text": "使用說明還沒生出來........."
        };
        break;

      default:
        // displayText = "指令輸入錯誤，請用 /poll help 查詢";
        displayText = {
          "response_type": "in_channel",
          "text": "指令輸入錯誤",
          "attachments": [
            {
              "text":"請用 /poll help 查詢"
            }
          ]
        };
        break;
    }
      context.succeed(displayText);

    });

};
