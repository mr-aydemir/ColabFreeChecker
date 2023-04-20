import datetime
import os
from pathlib import Path
import time
import cv2
from flask import Flask, request

import pyautogui

from flask_cors import CORS

def get_path(path):
    return os.path.join(str(Path(__file__).parent), path)


leave_png = cv2.imread(get_path('leave_blue.png'))
white_robo = cv2.imread(get_path('white_robo_tr.png'))
reload_png = cv2.imread(get_path('reload.png'))


def click(img, grayscale=True, confidence=0.7, cx=0.5, cy=0.5):
    # should be: 0<=cx<=1 and  0<=cy<=1
    try:
        now = datetime.datetime.now()
        while True:
            area = pyautogui.locateOnScreen(
                img, grayscale=grayscale, confidence=confidence)
            if area is not None:
                x, y = area.left+area.width*cx, area.top+area.height*cy
                pyautogui.click(x, y)
                message = 'Clicked '+str(x) + ", " + str(y)
                print(message)
                return message
            if datetime.datetime.now().second-now.second > 5:
                message = "area is not found, click wait end."
                print(message)
                return message
            time.sleep(0.5)
    except Exception as e:
        return str(e)


app = Flask(__name__)
CORS(app)

@app.route('/click_leave')
def click_leave():
    return click(leave_png, grayscale=True, confidence=0.7)


@app.route('/click_robo',methods=['POST'])
def click_robo():
    bbox=request.json
    if bbox is not None:
        cx=float(bbox["left"])+float(bbox["width"])/2
        cy=float(bbox["top"])+float(bbox["height"])/2
        pyautogui.click(cx, cy)
        message=f"clicked {cx}, {cy}"
        print(message)
        return message
    return click(white_robo, grayscale=True, confidence=0.7, cx=0.5)


@app.route('/click_reload')
def click_reload():
    return click(reload_png, grayscale=True, confidence=0.5)


if __name__ == '__main__':
    app.run()
