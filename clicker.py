import time
import cv2
import numpy as np
import pyautogui as pg


""" 

screenshot=pg.screenshot()
screenshot=cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR) """
""" from tkinter import *

#Create an instance of tkinter frame
win= Tk()

#Set the geometry of frame
win.geometry("650x250")

#Get the current screen width and height
screen_width = win.winfo_screenwidth()
screen_height = win.winfo_screenheight() """



while True:
    time.sleep(10)
    robo=pg.locateOnScreen('white_robo.png', grayscale=True, confidence=0.4)
    """ screen_width = win.winfo_screenwidth()
    screen_height = win.winfo_screenheight() """
    #print("Screen resolution", screen_width, screen_height)
    if robo is not None:
        pg.click(robo.left+robo.width/2, robo.top+robo.height/2)
        print("clicking...", robo.left+robo.width/2, robo.top+robo.height/2)



""" cv2.rectangle(screenshot, (robo.left, robo.top), (robo.left+robo.width, robo.top+robo.height), (0,255,255),2)

cv2.imshow("robo", screenshot)

cv2.waitKey(0)
 """