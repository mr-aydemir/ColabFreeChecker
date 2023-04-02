import time
import cv2
import numpy as np
import pyautogui as pg

screenshot=pg.screenshot()
screenshot=cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
area=pg.locateOnScreen('leave_dart_tr.png', grayscale=True, confidence=0.7)
if area is not None:
    pg.click(area.left+area.width/2, area.top+area.height/2)
    """ cv2.rectangle(screenshot, (area.left, area.top), (area.left+area.width, area.top+area.height), (0,255,255),2)
    cv2.imshow("robo", screenshot)
    cv2.waitKey(0) """