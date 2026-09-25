<div id="ch1-summary"></div>

### Chapter 1 summary: what this week builds on / 1. Bölüm özeti

The textbook's own one-page summary of Chapter 1, kept here so it is the first thing you meet in Week 02. Every equation number is the textbook's. If any line below is not obvious, the [Week 01 notes](Week_01.ipynb) and the [products-of-vectors review](../w1/recap.html) are where to go before continuing.

**Physical quantities and units.** Three fundamental physical quantities are mass, length and time; their SI units are the kilogram, the metre and the second. Derived units for other quantities are products or quotients of these. Equations must be **dimensionally consistent**: two terms can be added only when they have the same units. (Examples 1.1 and 1.2.)

**Significant figures.** The accuracy of a measurement is shown by its number of significant figures or by a stated uncertainty. The significant figures in a computed result follow the rules of Table 1.2, and when only crude estimates are available for the input data, an order-of-magnitude estimate is still useful. (Examples 1.3 and 1.4.) The two textbook illustrations, with the significant figures the data actually support:

$$\pi=\frac{C}{2r}=\frac{0.424\ \mathrm m}{2(0.06750\ \mathrm m)}=3.14,\qquad 123.62+8.9=132.5.$$

**Scalars, vectors and vector addition.** Scalar quantities are numbers and combine by ordinary arithmetic. Vector quantities have direction as well as magnitude and combine by the rules of vector addition: place the second vector's tail at the first vector's head, and the sum runs from the first tail to the last head. The negative of a vector has the same magnitude but the opposite direction. (Example 1.5.)

**Vector components and vector addition.** Vectors can be added with components: the $x$-component of $\vec{\mathbf R}=\vec{\mathbf A}+\vec{\mathbf B}$ is the sum of the $x$-components of $\vec{\mathbf A}$ and $\vec{\mathbf B}$, and likewise for $y$ and $z$ — equations (1.9). (Examples 1.6 and 1.7.)

$$R_x=A_x+B_x,\qquad R_y=A_y+B_y,\qquad R_z=A_z+B_z.$$

**Unit vectors.** Unit vectors describe directions in space; each has magnitude 1 and no units. The unit vectors $\hat{\imath}$, $\hat{\jmath}$ and $\hat{k}$, aligned with the $x$-, $y$- and $z$-axes of a rectangular coordinate system, let any vector be written from its components — equation (1.14). (Example 1.8.)

$$\vec{\mathbf A}=A_x\hat{\imath}+A_y\hat{\jmath}+A_z\hat{k}.$$

**Scalar product.** The scalar product $C=\vec{\mathbf A}\cdot\vec{\mathbf B}$ of two vectors is a **scalar**. It can be written from the magnitudes of $\vec{\mathbf A}$ and $\vec{\mathbf B}$ and the angle $\phi$ between them, or from their components — equations (1.16) and (1.19). It is commutative, $\vec{\mathbf A}\cdot\vec{\mathbf B}=\vec{\mathbf B}\cdot\vec{\mathbf A}$, and the scalar product of two perpendicular vectors is zero. (Examples 1.9 and 1.10.)

$$\vec{\mathbf A}\cdot\vec{\mathbf B}=AB\cos\phi=\lvert\vec{\mathbf A}\rvert\lvert\vec{\mathbf B}\rvert\cos\phi=A_xB_x+A_yB_y+A_zB_z.$$

**Vector product.** The vector product $\vec{\mathbf C}=\vec{\mathbf A}\times\vec{\mathbf B}$ of two vectors is a third **vector**. Its magnitude depends on the magnitudes of $\vec{\mathbf A}$ and $\vec{\mathbf B}$ and the angle $\phi$ between them — equation (1.20); its direction is perpendicular to the plane of the two vectors, given by the right-hand rule; its components come from those of $\vec{\mathbf A}$ and $\vec{\mathbf B}$ — equations (1.25). It is not commutative: $\vec{\mathbf A}\times\vec{\mathbf B}=-\vec{\mathbf B}\times\vec{\mathbf A}$, and the vector product of two parallel or antiparallel vectors is zero. (Example 1.11.)

$$C=AB\sin\phi,\qquad C_x=A_yB_z-A_zB_y,\quad C_y=A_zB_x-A_xB_z,\quad C_z=A_xB_y-A_yB_x.$$

**Where Chapter 2 picks this up.** Motion along a line needs only one component, so a vector's whole direction collapses into the **sign** of $x$, $v_x$ and $a_x$; the unit multipliers of §1.4 convert every km/h you meet this week into m/s; and the significant-figure rules decide how many digits a stopping distance can honestly carry.

**TR:** Kitabın 1. Bölüm özetinin aynısı, 2. haftanın başında dursun diye buraya alındı: temel nicelikler ve SI birimleri, boyut tutarlılığı, anlamlı basamaklar, skaler/vektörel nicelikler ve uç uca toplama, bileşenler (1.9), birim vektörler (1.14), skaler çarpım (1.16, 1.19) ve vektörel çarpım (1.20, 1.25). Bu hafta doğru boyunca hareket için vektörün yönü yalnızca bir işarete iner; km/h → m/s dönüşümleri §1.4'ün birim çarpanlarıyla yapılır.
