"""Extract joint axes/limits and the original wave from the shipped Fetch URDF."""
from pathlib import Path
import json, xml.etree.ElementTree as ET
root=ET.parse("client/public/assets/fetch/fetch.urdf").getroot()
joints={}
for joint in root.findall("joint"):
 if joint.attrib["type"]=="fixed":continue
 limit=joint.find("limit")
 joints[joint.attrib["name"]]={"type":joint.attrib["type"],"axis":[float(x) for x in joint.find("axis").attrib["xyz"].split()],"min":float(limit.attrib.get("lower","-1000")) if limit is not None else -1000,"max":float(limit.attrib.get("upper","1000")) if limit is not None else 1000}
rest={"shoulder_pan_joint":1.81,"shoulder_lift_joint":2.0,"elbow_flex_joint":1.71,"wrist_flex_joint":1.5,"wrist_roll_joint":.05,"torso_lift_joint":.03,"upperarm_roll_joint":.12,"r_gripper_finger_joint":.01,"l_gripper_finger_joint":.01}
frames=[
 [0,rest],
 [.9,{"shoulder_pan_joint":1.75,"shoulder_lift_joint":1.9,"elbow_flex_joint":1.6,"wrist_flex_joint":1.1,"wrist_roll_joint":-.3,"torso_lift_joint":.06,"upperarm_roll_joint":-3.1}],
 [1.4,{"shoulder_pan_joint":1.1,"shoulder_lift_joint":.35,"elbow_flex_joint":1,"wrist_flex_joint":1.15,"wrist_roll_joint":-.7,"torso_lift_joint":.06,"upperarm_roll_joint":-3.1}],
 [1.9,{"shoulder_pan_joint":1.1,"shoulder_lift_joint":1.25,"elbow_flex_joint":1,"wrist_flex_joint":.15,"wrist_roll_joint":.15,"torso_lift_joint":.06,"upperarm_roll_joint":-3.1}],
 [2.4,{"shoulder_pan_joint":1.1,"shoulder_lift_joint":.35,"elbow_flex_joint":1,"wrist_flex_joint":1.15,"wrist_roll_joint":-.7,"torso_lift_joint":.06,"upperarm_roll_joint":-3.1}],
 [2.9,{"shoulder_pan_joint":1.1,"shoulder_lift_joint":1.25,"elbow_flex_joint":1,"wrist_flex_joint":.15,"wrist_roll_joint":.15,"torso_lift_joint":.06,"upperarm_roll_joint":-3.1}],
 [3.6,rest]]
text = "// Derived from the original portfolio Fetch URDF and animation; no model assumptions." + chr(10)
text += "export const fetchJoints = " + json.dumps(joints) + ";" + chr(10)
text += "export const fetchRest = " + json.dumps(rest) + ";" + chr(10)
text += "export const fetchWave: {time:number;pose:Record<string,number>}[] = " + json.dumps([{"time":t,"pose":{**rest,**pose}} for t,pose in frames]) + ";" + chr(10)
Path("client/src/data/fetch-rig.ts").write_text(text)
