"""Rebuild original instructional drawings for the selected Y&F Chapter 1 exercises."""
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon, Ellipse, Arc
OUT=Path(__file__).resolve().parents[1]/'assets/week01-solutions'
OUT.mkdir(exist_ok=True)
plt.rcParams.update({'font.size':12,'axes.titlesize':14,'font.family':'DejaVu Sans','savefig.facecolor':'white'})
BLUE='#2057a5'; ORANGE='#c35320'; GREEN='#227149'; GRAY='#526171'
def save(fig,n):
    fig.savefig(OUT/f'exercise-1-{n:02}.png',dpi=160,bbox_inches='tight',pad_inches=.22)
    plt.close(fig)
def panels(titles):
    fig,axs=plt.subplots(len(titles),1,figsize=(7,4.5*len(titles)),layout='constrained',squeeze=False)
    for ax,title in zip(axs[:,0],titles): ax.set_title(title,pad=15)
    return fig,list(axs[:,0])
def axes(ax,points,unit=''):
    pts=np.array([(0,0)]+list(points));lo=pts.min(axis=0);hi=pts.max(axis=0);span=max(hi-lo);span=max(span,1)
    ax.set_xlim(lo[0]-.25*span,hi[0]+.25*span);ax.set_ylim(lo[1]-.2*span,hi[1]+.2*span)
    ax.set_aspect('equal',adjustable='box');ax.axhline(0,color=GRAY,lw=.7);ax.axvline(0,color=GRAY,lw=.7)
    ax.grid(alpha=.15);ax.set_xlabel('x'+(f' ({unit})' if unit else ''));ax.set_ylabel('y'+(f' ({unit})' if unit else ''))
def arrow(ax,start,end,label,color=BLUE,offset=(7,7),style='-'):
    ax.annotate('',xy=end,xytext=start,arrowprops={'arrowstyle':'-|>','color':color,'lw':2.3,'linestyle':style,'mutation_scale':15,'shrinkA':0,'shrinkB':0})
    if label:ax.annotate(label,xy=(np.array(start)+end)/2,xytext=offset,textcoords='offset points',color=color,fontsize=12,bbox=dict(facecolor='white',edgecolor='none',alpha=.9,pad=1.5))
def vector(ax,v,label='A',color=BLUE,offset=(8,8),components=False):
    arrow(ax,(0,0),v,label,color,offset)
    if components:ax.plot([0,v[0],v[0]],[0,0,v[1]],'--',color=GRAY,alpha=.65)
def flow(n,title,steps,footer):
    fig,axs=panels([title]);ax=axs[0];ax.set_axis_off();ax.set_xlim(0,1);ax.set_ylim(0,1)
    ys=np.linspace(.88,.2,len(steps))
    for j,(y,txt) in enumerate(zip(ys,steps)):
        ax.text(.5,y,txt,ha='center',va='center',bbox=dict(boxstyle='round,pad=.5',facecolor='#eef4fa',edgecolor=BLUE),fontsize=13)
        if j and n not in (13,14):ax.annotate('',xy=(.5,y+.065),xytext=(.5,ys[j-1]-.065),arrowprops=dict(arrowstyle='->',color=GRAY))
    ax.text(.5,.035,footer,ha='center',va='bottom',fontsize=11,color=GRAY);save(fig,n)
flow(1,'1.1 | Follow the units',[r'mile $\rightarrow$ foot $\rightarrow$ inch',r'inch $\rightarrow$ centimetre $\rightarrow$ kilometre',r'For km $\rightarrow$ ft: reverse the relevant ratios'],'Every conversion ratio equals one.')
for n,title,edge,note in [(2,'1.2 | Convert all three edges','1 in = 2.54 cm',r'$1\ \mathrm{in^3}=(2.54)^3\ \mathrm{cm^3}$'),(4,'1.4 | The volume unit is in the denominator','1 m = 100 cm',r'$1\ \mathrm{m^3}=10^6\ \mathrm{cm^3}$')]:
    fig,axs=panels([title]);ax=axs[0];ax.set_axis_off();ax.set_xlim(-.5,4);ax.set_ylim(-.7,3.4);ax.set_aspect('equal')
    square=np.array([[0,0],[2,0],[2,2],[0,2],[0,0]]);off=np.array([.8,.65]);ax.plot(*square.T,color=BLUE)
    back=square+off
    for j in range(4):
        ax.plot(*back[j:j+2].T,color=BLUE,linestyle='--' if j in (0,3) else '-')
    for j,p in enumerate(square[:4]):ax.plot([p[0],p[0]+off[0]],[p[1],p[1]+off[1]],color=BLUE,linestyle='--' if j==0 else '-')
    ax.text(1,-.28,edge,ha='center');ax.text(3.4,1.3,'All edges\nare equal',ha='center',color=GRAY);ax.text(1.4,3.05,note,ha='center',fontsize=15);save(fig,n)
fig,axs=panels(['1.3 | Light travel time in vacuum']);ax=axs[0];ax.axis('off');ax.set_xlim(-.6,4.6);ax.set_ylim(-1.3,1.8)
ax.plot([0,4],[0,0],'o',color=BLUE);arrow(ax,(0,0),(4,0),'',BLUE)
ax.text(0,-.3,'Start\n$t=0$',ha='center',va='top');ax.text(4,-.3,'Finish\n$t=d/c$',ha='center',va='top')
ax.text(2,.3,r'$c=2.998\times10^8\ \mathrm{m/s}$',ha='center',color=BLUE)
ax.annotate('',xy=(4,1),xytext=(0,1),arrowprops=dict(arrowstyle='|-|',color=GRAY))
ax.text(2,1.2,'d = 1.00 ft = 0.3048 m',ha='center');ax.text(2,-1.1,'Schematic: light travels from the start to the finish.',ha='center',fontsize=11,color=GRAY);save(fig,3)
flow(5,'1.5 | Seconds to years',['1.00 Gs = 1.00 × 10⁹ s','seconds ÷ 60 → minutes ÷ 60 → hours','hours ÷ 24 → days ÷ 365 → years'],'This exercise uses a 365-day year.')
fig,axs=panels(['1.11 | Two measured sides']);ax=axs[0];ax.add_patch(Rectangle((0,0),12,5.98,fc='#eef4fa',ec=BLUE,lw=2));ax.text(6,-1,'L = 12 mm',ha='center');ax.text(6,7,'Area = Lw; perimeter = 2L + 2w',ha='center');ax.text(13,3,'w =\n5.98 mm',va='center');ax.set_xlim(-1,16);ax.set_ylim(-2,8);ax.set_aspect('equal');ax.axis('off');save(fig,11)
fig,axs=panels(['1.12 | A wire modelled as a cylinder']);ax=axs[0];ax.set_axis_off();ax.set_xlim(-2,7);ax.set_ylim(-2,2.8)
ax.add_patch(Rectangle((0,-.75),5,1.5,fc='#eef4fa',ec=BLUE));ax.add_patch(Ellipse((0,0),.8,1.5,fc='#dce8f7',ec=BLUE));ax.add_patch(Ellipse((5,0),.8,1.5,fc='white',ec=BLUE));arrow(ax,(0,0),(0,.75),'r',ORANGE,(8,0));ax.text(2.5,-1.3,'h = 12.1 cm',ha='center');ax.text(2.5,1.65,'r = 0.036 cm;  V = πr²h',ha='center');ax.text(2.5,-1.9,'Schematic: the real wire is much thinner.',ha='center',fontsize=11,color=GRAY);save(fig,12)
flow(13,'1.13 | Compare with the reference year',[r'reference: $365.24\times24\times3600$ s',r'approximation: $\pi\times10^7$ s',r'error = approximation − reference'],'Percent error = error ÷ reference × 100%.')
flow(14,'1.14 | Round to six significant figures',['π = 3.141592653… → 3.14159','22 / 7 = 3.142857142… → 3.14286','355 / 113 = 3.141592920… → 3.14159'],'355/113 agrees with π at six significant figures.')
fig,axs=panels(['1.24 | Four vectors, four quadrants']);ax=axs[0];pts=[(2,-1),(2,1),(-2,1),(-2,-1)];axes(ax,pts,'m')
for v,l in zip(pts,['(a) (2, −1)','(b) (2, 1)','(c) (−2, 1)','(d) (−2, −1)']):
 vector(ax,v,'',components=True)
 ax.annotate(l,xy=v,xytext=(0,12 if v[1]>0 else -22),textcoords='offset points',ha='center',color=BLUE)
save(fig,24)
for n,v,start,end,lab in [(26,(-16,-16/np.tan(np.deg2rad(34))),236,270,'34° from −y, clockwise'),(27,(-9.6*np.tan(np.deg2rad(32)),9.6),90,122,'32° from +y, counter-clockwise')]:
 fig,axs=panels([f'1.{n} | {lab}']);ax=axs[0];axes(ax,[v],'m');vector(ax,v,'A',offset=(-24,0) if n==26 else (8,8),components=True);r=np.linalg.norm(v)*.26;ax.add_patch(Arc((0,0),2*r,2*r,theta1=start,theta2=end,color=ORANGE,lw=2));mid=np.deg2rad((start+end)/2);ax.text(1.5*r*np.cos(mid),1.5*r*np.sin(mid),f'{end-start}°',ha='center',va='center',color=ORANGE,bbox=dict(facecolor='white',edgecolor='none',pad=1))
 ax.text(.04,.96,f'x < 0; y {"<" if n==26 else ">"} 0',transform=ax.transAxes,va='top',fontsize=11);save(fig,n)
fig,axs=panels(['1.30(a) | Quadrant II','1.30(b) | Quadrant III','1.30(c) | Quadrant IV'])
for ax,v,u in zip(axs,[(-8.6,5.2),(-9.7,-2.45),(7.75,-2.7)],['cm','m','km']):axes(ax,[v],u);vector(ax,v,'A',components=True)
save(fig,30)
fig,axs=panels(['1.31 | The route and the resultant']);ax=axs[0];pts=np.array([(0,0),(0,3.25),(-2.2,3.25),(-2.2,1.75)]);axes(ax,pts,'km')
for a,b in zip(pts[:-1],pts[1:]):arrow(ax,a,b,'',BLUE)
ax.text(.18,1.6,'3.25 km N',rotation=90,va='center',color=BLUE);ax.text(-2.45,2.5,'1.50 km S',rotation=90,va='center',color=BLUE);ax.text(-1.1,3.45,'2.20 km W',ha='center',color=BLUE)
vector(ax,pts[-1],'R',GREEN,(-15,-20));ax.plot(0,0,'o',color=GRAY);save(fig,31)
A=np.array([8*np.cos(np.deg2rad(127)),8*np.sin(np.deg2rad(127))]);R=np.array([0,-12]);B=R-A
fig,axs=panels(['1.32 | A + B must reach the given endpoint']);ax=axs[0];axes(ax,[A,R,B],'m');vector(ax,A,'A');arrow(ax,A,R,'B',ORANGE,(-20,0));vector(ax,R,'',GREEN);ax.text(.7,-11,'R',color=GREEN);vector(ax,B,'B',ORANGE,(8,0));save(fig,32)
A=np.array([1.4,2.8*np.sin(np.pi/3)]);B=np.array([.95,-1.9*np.sin(np.pi/3)])
fig,axs=panels(['1.33(a) | A + B','1.33(b) | A − B = A + (−B)','1.33(c) | B − A = B + (−A)'])
for ax,u,v,lu,lv in zip(axs,[A,A,B],[B,-B,-A],['A','A','B'],['B','−B','−A']):axes(ax,[u,u+v],'cm');vector(ax,u,lu,offset=(8,8) if lu=='B' else (-22,8));arrow(ax,u,u+v,lv,ORANGE,(18,0));vector(ax,u+v,'R',GREEN,(0,-20) if lv=='B' else (-20,-8))
save(fig,33)
for n in [36,40,42]:
 A=np.array([4.,7.]);B=np.array([5.,-2.]);fig,axs=panels([f'1.{n} | Vectors with a common origin']);ax=axs[0];axes(ax,[A,B,A-B] if n==36 else [A,B]);vector(ax,A,'A',offset=(20,-4) if n==36 else (-22,8));vector(ax,B,'B',ORANGE)
 if n==36:arrow(ax,B,A,'A − B',GREEN,(8,0));vector(ax,A-B,'A − B',GREEN,(8,0))
 else:
  a=np.degrees(np.arctan2(A[1],A[0]));b=np.degrees(np.arctan2(B[1],B[0]));ax.add_patch(Arc((0,0),4,4,theta1=b,theta2=a,color=GREEN,lw=2));ax.text(2.1,1.3,'φ',color=GREEN,fontsize=16)
  if n==42:ax.text(.04,.96,'A → B: clockwise\nA × B: into page (−z)',transform=ax.transAxes,va='top',fontsize=11,bbox=dict(facecolor='white',edgecolor='none',alpha=.95,pad=3))
 save(fig,n)
fig=plt.figure(figsize=(7,6),layout='constrained');ax=fig.add_subplot(projection='3d');ax.set_title('1.39 | Three-dimensional vectors\nPerspective view',pad=15)
for v,l,c in [((-2,3,4),'A',BLUE),((3,1,-3),'B',ORANGE),((-5,2,7),'A − B',GREEN)]:ax.quiver(0,0,0,*v,color=c,arrow_length_ratio=.1,linewidth=2);ax.text(*(np.array(v)+[.15,.1,.25]),l,color=c,bbox=dict(facecolor='white',edgecolor='none',alpha=.85,pad=1))
ax.view_init(elev=24,azim=-35)
ax.scatter([0],[0],[0],color=GRAY,s=20);ax.text(-2,-1,-.8,'O (0, 0, 0)',fontsize=10,color=GRAY,bbox=dict(facecolor='white',edgecolor='none',alpha=.9,pad=1))
for end in [(4,0,0),(0,6,0),(0,0,8)]:ax.plot([0,end[0]],[0,end[1]],[0,end[2]],color=GRAY,lw=.8,linestyle='--')
ax.set_xlim(-6,6);ax.set_ylim(-5,7);ax.set_zlim(-4,8);ax.set_box_aspect((1,1,1));ax.set_xlabel('x');ax.set_ylabel('y');ax.set_zlabel('z');save(fig,39)
fig,axs=panels(['1.43(a) | Expect an obtuse angle','1.43(b) | Expect an acute angle','1.43(c) | Test for perpendicular vectors'])
for ax,A,B in zip(axs,[(-2,6),(3,5),(-4,2)],[(2,-3),(10,6),(7,14)]):
 axes(ax,[A,B]);vector(ax,A,'A',offset=(0,18) if A==(-4,2) else (-22,8));vector(ax,B,'B',ORANGE,offset=(8,-14))
 aa=np.arctan2(A[1],A[0]);bb=np.arctan2(B[1],B[0]);delta=(aa-bb+np.pi)%(2*np.pi)-np.pi;r=min(np.linalg.norm(A),np.linalg.norm(B))*.32
 if abs(np.dot(A,B))<1e-10:
  u=np.array(A)/np.linalg.norm(A)*r;v=np.array(B)/np.linalg.norm(B)*r;ax.plot(*np.array([u,u+v,v]).T,color=GREEN,lw=1.5)
 else:
  start=min(bb,bb+delta);end=max(bb,bb+delta);ax.add_patch(Arc((0,0),2*r,2*r,theta1=np.degrees(start),theta2=np.degrees(end),color=GREEN,lw=1.5))
  mid=(start+end)/2;ax.text(1.5*r*np.cos(mid),1.5*r*np.sin(mid),'φ',color=GREEN,ha='center',va='center')
save(fig,43)
A=np.array([1.4,2.8*np.sin(np.pi/3)]);B=np.array([.95,-1.9*np.sin(np.pi/3)])
fig,axs=panels(['1.44 | The parallelogram and its normal']);ax=axs[0];axes(ax,[A,B,A+B],'cm');ax.add_patch(Polygon([(0,0),A,A+B,B],fc='#e5f2eb',ec=GREEN,alpha=.7));vector(ax,A,'A',offset=(-22,8));vector(ax,B,'B',ORANGE);ax.add_patch(Arc((0,0),1.3,1.3,theta1=-60,theta2=60,color=GREEN,lw=2));ax.text(.72,0,'120°',color=GREEN);ax.text(.04,.97,'A × B: into page (−z)\nB × A: out of page (+z)',transform=ax.transAxes,va='top',fontsize=11,bbox=dict(facecolor='white',edgecolor='none',alpha=.95,pad=3));save(fig,44)
print('Created',len(list(OUT.glob('*.png'))),'drawings')
