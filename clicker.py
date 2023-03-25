import cv2
import numpy as np
import pyautogui as pg

screenshot=pg.screenshot()
screenshot=cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)

robo=pg.locateOnScreen('white_robo.png')
cv2.rectangle(screenshot, (robo.left, robo.top), (robo.left+robo.width, robo.top+robo.height), (0,255,255),2)

cv2.imshow("robo", screenshot)

cv2.waitKey(0)
