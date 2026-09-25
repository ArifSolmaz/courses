#!/usr/bin/env python3
"""Regenerate original, equation-driven SVG figures for the 20 Week 2 exercises."""
import math
from pathlib import Path
from html import escape
OUT=Path(__file__).resolve().parents[1]/'assets/week02-solutions'
BLUE='#145e96'; RED='#b0442c'; INK='#24354b'; GREEN='#247052'
def txt(x,y,s,size=20,color=INK,anchor='start'):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}">{escape(s)}</text>'
def line(x,y,u,v,color=INK,dash=False,arrow=False):
 return f'<path d="M{x},{y} L{u},{v}" fill="none" stroke="{color}" stroke-width="2.5"'+(' stroke-dasharray="6 5"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def save(ex,body,h=250):
 OUT.mkdir(exist_ok=True)
 (OUT/f'exercise-2-{ex:02}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 {h}" role="img" aria-label="Solution drawing for Exercise 2.{ex}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs><rect width="560" height="{h}" rx="14" fill="#f6f8fb"/><g font-family="Arial, sans-serif">{body}</g></svg>\n')
def route(ex,title,labels,arrows):
 b=txt(24,32,title,22)+line(40,190,520,190,arrow=True)+txt(485,224,'+x',18)
 for x,label in labels:b+=line(x,184,x,196)+txt(x,175,label,18,anchor='middle')
 for y,x,u,label in arrows:b+=line(x,y,u,y,BLUE,arrow=True)+txt((x+u)/2,y-12,label,20,BLUE,'middle')
 save(ex,b)
def graph(title,f,tmax,ymin,ymax,yticks,ylabel,offset=0,extra=''):
 left,right,top,bottom=80,510,55+offset,250+offset
 X=lambda t:left+(right-left)*t/tmax
 Y=lambda v:bottom-(v-ymin)/(ymax-ymin)*(bottom-top)
 b=txt(24,28+offset,title,22)+txt(28,43+offset,ylabel,16)
 for v in yticks:b+=line(left,Y(v),right,Y(v),'#cbd5df')+txt(left-10,Y(v)+6,f'{v:g}',16,anchor='end')
 b+=line(left,top,left,bottom)+line(left,Y(0) if ymin<=0<=ymax else bottom,right,Y(0) if ymin<=0<=ymax else bottom)
 for t in [0,tmax/2,tmax]:b+=txt(X(t),278+offset,f'{t:.3g}',16,anchor='middle')
 b+=txt(505,300+offset,'t (s)',16,anchor='end')
 pts=' '.join(f'{X(tmax*i/240):.3f},{Y(f(tmax*i/240)):.3f}' for i in range(241))
 b+=f'<polyline points="{pts}" fill="none" stroke="{BLUE}" stroke-width="3"/>'+extra
 return b
route(1,'One direction: distance = displacement',[(65,'0'),(465,'25.0 m')],[(105,65,465,'6.25 m/s average · 4.00 s')])
route(2,'Return flight: displacement is negative',[(90,'Nest: 0'),(460,'5150 km')],[(105,460,90,'Return in 13.5 days')])
route(3,'Same route · different durations',[(65,'Start'),(465,'Finish')],[(80,65,465,'105 km/h · 110 min'),(135,65,465,'70 km/h · 165 min')])
route(4,'Outward and back · east is positive',[(75,'−80 m'),(190,'0'),(480,'+200 m')],[(75,190,480,'200 m east'),(125,480,75,'280 m west')])
route(5,'The bench is east of the house',[(65,'House: 0'),(205,'Bench: 20'),(485,'Mill: 60 m')],[(75,65,485,'60.0 m east · 28.0 s'),(125,485,205,'40.0 m west · 36.0 s')])
save(6,graph('Position: x = 1.50t² − 0.0500t³',lambda t:1.5*t*t-.05*t**3,4,0,24,[0,5.6,20.8],'x (m)',extra=''.join(f'<circle cx="{80+430*t/4}" cy="{250-(1.5*t*t-.05*t**3)*195/24}" r="4" fill="{RED}"/>' for t in [0,2,4])),320)
save(7,graph('Rest at t = 0 and t = 13.33 s',lambda t:4.8*t-.36*t*t,16,-18,20,[-15,0,16],'vₓ (m/s)'),320)
save(8,graph('Position is still rising at 8.00 s',lambda t:28+12.4*t-.045*t**3,8,0,120,[0,28,104],'x (m)'),320)
b=''
for off,last,title in [(0,3,'Original: both velocities positive'),(310,-3,'Variant: final velocity negative')]:
 b+=txt(24,30+off,title,22)+txt(24,57+off,'vₓ (m/s)',17)
 X=lambda t:80+140*t
 Y=lambda v:off+175-v*30
 for v in [-3,0,2,3]:b+=line(80,Y(v),500,Y(v),'#cbd5df')+txt(68,Y(v)+5,str(v),16,anchor='end')
 for t in [0,1,2,3]:b+=txt(X(t),285+off,str(t),17,anchor='middle')
 for ta,tb,v in [(0,2,2),(2,3,last)]:
  b+=f'<rect x="{X(ta)}" y="{min(Y(0),Y(v))}" width="{X(tb)-X(ta)}" height="{abs(Y(0)-Y(v))}" fill="{BLUE if v>0 else RED}" opacity=".12"/>'
  b+=line(X(ta),Y(v),X(tb),Y(v),BLUE if v>0 else RED)
 b+=line(X(2),Y(2),X(2),Y(last),BLUE,True)+line(80,off+68,80,off+266)+line(80,Y(0),505,Y(0))+txt(500,305+off,'t (s)',16,anchor='end')
save(9,b,635)
save(14,graph('Velocity: vₓ = 0.860t²',lambda t:.86*t*t,5,0,23,[0,12,21.5],'vₓ (m/s)'),320)
save(15,graph('Velocity: slope grows with time',lambda t:3+.1*t*t,5,0,6,[0,3,5.5],'vₓ (m/s)')+graph('Acceleration: area = Δv',lambda t:.2*t,5,0,1.2,[0,.5,1],'aₓ (m/s²)',320),640)
b=txt(24,32,'Three separate 10 s intervals',22)
for y,title,start,end in [(90,'(a)',15,5),(170,'(b)',-5,-15),(250,'(c)',15,-15)]:
 b+=txt(30,y,title)+txt(100,y,f'{start:+.1f} m/s')+line(230,y-7,300,y-7,arrow=True)+txt(320,y,f'{end:+.1f} m/s')+txt(100,y+29,f'Δv = {end-start:+.1f} m/s',18,RED)
b+=txt(24,320,'Positive = right; all three Δv values point left.',18)
save(16,b,345)
route(19,'Constant acceleration along the run',[(65,'Start'),(465,'70.0 m')],[(80,65,465,'6.00 s'),(130,65,465,'8.33 m/s → 15.0 m/s')])
save(20,graph('Racquet contact: area = 1.0971 m',lambda t:2438*t,.03,0,80,[0,36.57,73.14],'vₓ (m/s)'),320)
route(21,'Uniform acceleration during the pitch',[(65,'Rest'),(465,'45.0 m/s')],[(90,65,465,'1.50 m contact distance'),(140,65,465,'Contact time: 66.7 ms')])
b=graph('Ramp car vs steady traffic',lambda t:20*t/12,12,0,24,[0,10,20],'vₓ (m/s)')+line(80,87.5,510,87.5,RED)+txt(250,76,'Traffic: 20 m/s',18,RED)+txt(270,200,'Ramp car',18,BLUE)
save(24,b,320)
b=txt(24,32,'Distance s is measured along the incline',21)+line(75,75,490,260)+line(95,78,510,263,BLUE,arrow=True)+txt(105,66,'s = 0; v = 0',18)+txt(295,95,'s = 3.40 m',18)+txt(295,122,'v = 2.69 m/s',18,BLUE)+txt(340,294,'6.80 m; 3.80 m/s',18)+f'<rect x="274" y="153" width="23" height="23" fill="{BLUE}" transform="rotate(24 285 164)"/>'+txt(24,328,'Schematic slope angle; not specified by the question.',16)
save(30,b,350)
b=txt(24,32,'Up is positive; ground is y = 0',22)+line(75,280,75,55,arrow=True)+txt(38,65,'+y',18)+line(75,280,520,280)+txt(320,307,'Street: 0 m',18)+line(80,155,265,155,'#98a8b9',True)+txt(90,181,'Roof: 30.0 m',18)+line(300,155,300,65,BLUE,arrow=True)+txt(330,115,'Launch: +22.0 m/s',18,BLUE)+line(315,70,315,272,RED,arrow=True)+txt(332,235,'Impact: −32.8 m/s',18,RED)+txt(90,55,'Apex: 54.7 m',18)
save(32,b,335)
save(37,graph('Velocity changes sign; gravity does not',lambda t:24-9.81*t,4,-20,26,[-15.2,0,24],'vᵧ (m/s)')+graph('Acceleration throughout free flight',lambda t:-9.81,4,-12,0,[-9.81,0],'aᵧ (m/s²)',320),640)
T=(5+math.sqrt(809.8))/9.81
save(42,graph('Height: rise, turn, then fall',lambda t:40+5*t-4.905*t*t,T,0,45,[0,20,40],'y (m)')+graph('Velocity: zero at t = 0.510 s',lambda t:5-9.81*t,T,-30,10,[-28.46,0,5],'vᵧ (m/s)',320)+graph('Acceleration: constant until impact',lambda t:-9.81,T,-12,0,[-9.81,0],'aᵧ (m/s²)',640),960)
print('Wrote 20 original SVG figures')
