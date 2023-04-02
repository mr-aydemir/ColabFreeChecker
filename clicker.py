import time
import cv2
import numpy as np
import pyautogui as pg




screenshot=pg.screenshot()
screenshot=cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
from tkinter import *

#Create an instance of tkinter frame
win= Tk()

#Set the geometry of frame
win.geometry("650x250")

#Get the current screen width and height
screen_width = win.winfo_screenwidth()
screen_height = win.winfo_screenheight()


def robo_click():
    robo=pg.locateOnScreen('white_robo.png', grayscale=True, confidence=0.5)
    #print("Screen resolution", screen_width, screen_height)
    if robo is not None:
        pg.click(robo.left+20, robo.top+15)
        print("robo clicking...", robo.left+robo.width/2, robo.top+robo.height/2)
    else:
        robo=pg.locateOnScreen('reload.png', confidence=0.5)
        if robo is not None:
            pg.click(robo.left+robo.width/2, robo.top+robo.height/2)
            print("reload clicking...", robo.left+robo.width/2, robo.top+robo.height/2)

def leave_click():
    area=pg.locateOnScreen('leave.png', grayscale=True, confidence=0.7)
    if area is not None:
        pg.click(area.left+area.width/2, area.top+area.height/2)
        print("leave clicking... ",area.left+area.width/2, area.top+area.height/2)



while True:
    leave_click()
    robo_click()
    time.sleep(20)




""" cv2.rectangle(screenshot, (robo.left, robo.top), (robo.left+robo.width, robo.top+robo.height), (0,255,255),2)

cv2.imshow("robo", screenshot)

cv2.waitKey(0)
 """