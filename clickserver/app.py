import datetime
import os
from pathlib import Path
import time
import cv2
from flask import Flask
import pyautogui


def get_path(path):
    return os.path.join(str(Path(__file__).parent), path)


leave_png = cv2.imread(get_path('leave.png'))
white_robo = cv2.imread(get_path('white_robo.png'))
reload_png = cv2.imread(get_path('reload.png'))


def click(img, grayscale=True, confidence=0.7, cx=0.5, cy=0.5):
    # should be: 0<=cx<=1 and  0<=cy<=1
    now = datetime.datetime.now()
    while True:
        area = pyautogui.locateOnScreen(
            img, grayscale=grayscale, confidence=confidence)
        if area is not None:
            x, y = area.left+area.width*cx, area.top+area.height*cy
            pyautogui.click(x, y)
            return 'Clicked '+str(x) + ", " + str(y)
        if datetime.datetime.now().second-now.second > 5:
            return "click wait end."
        time.sleep(0.5)


app = Flask(__name__)

""" @app.route('/click_test')
def click_test():
    return click('leave_dart_tr.png', grayscale=True, confidence=0.7) """


@app.route('/click_leave')
def click_leave():
    return click(leave_png, grayscale=True, confidence=0.7)


@app.route('/click_robo')
def click_robo():
    return click(white_robo, grayscale=True, confidence=0.5, cx=0.1)


@app.route('/click_reload')
def click_reload():
    return click(reload_png, grayscale=True, confidence=0.5)


if __name__ == '__main__':
    app.run()
