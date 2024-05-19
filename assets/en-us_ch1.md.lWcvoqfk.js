import{_ as e}from"./chunks/ch1.DEF56CF_.js";import{_ as a,c as t,o as r,a1 as i}from"./chunks/framework.biRBrEtS.js";const b=JSON.parse('{"title":"1. Reliable, Scalable, and Maintainable Applications","description":"","frontmatter":{},"headers":[],"relativePath":"en-us/ch1.md","filePath":"en-us/ch1.md"}'),n={name:"en-us/ch1.md"},o=i('<h1 id="_1-reliable-scalable-and-maintainable-applications" tabindex="-1">1. Reliable, Scalable, and Maintainable Applications <a class="header-anchor" href="#_1-reliable-scalable-and-maintainable-applications" aria-label="Permalink to &quot;1. Reliable, Scalable, and Maintainable Applications&quot;">​</a></h1><p><img src="'+e+'" alt=""></p><blockquote><p><em>The Internet was done so well that most people think of it as a natural resource like the Pacific Ocean, rather than something that was man-made. When was the last time a tech‐ nology with a scale like that was so error-free?</em></p><p>— <a href="http://www.drdobbs.com/architecture-and-design/interview-with-alan-kay/240003442" target="_blank" rel="noreferrer">Alan Kay</a>, in interview with <em>Dr Dobb’s Journal</em> (2012)</p></blockquote><hr><p>Many applications today are <em>data-intensive</em>, as opposed to <em>compute-intensive</em>. Raw CPU power is rarely a limiting factor for these applications—bigger problems are usually the amount of data, the complexity of data, and the speed at which it is changing.</p><p>A data-intensive application is typically built from standard building blocks that pro‐ vide commonly needed functionality. For example, many applications need to:</p><ul><li>Store data so that they, or another application, can find it again later (<em>databases</em>)</li><li>Remember the result of an expensive operation, to speed up reads (<em>caches</em>)</li><li>Allow users to search data by keyword or filter it in various ways (<em>search indexes</em>)</li><li>Send a message to another process, to be handled asynchronously (<em>stream pro‐ cessing</em>)</li><li>Periodically crunch a large amount of accumulated data (<em>batch processing</em>)</li></ul><p>If that sounds painfully obvious, that’s just because these <em>data systems</em> are such a suc‐ cessful abstraction: we use them all the time without thinking too much. When build‐ ing an application, most engineers wouldn’t dream of writing a new data storage engine from scratch, because databases are a perfectly good tool for the job.</p><p>But reality is not that simple. There are many database systems with different charac‐ teristics, because different applications have different requirements. There are vari‐ ous approaches to caching, several ways of building search indexes, and so on. When building an application, we still need to figure out which tools and which approaches are the most appropriate for the task at hand. And it can be hard to combine tools when you need to do something that a single tool cannot do alone.</p><p>This book is a journey through both the principles and the practicalities of data sys‐ tems, and how you can use them to build data-intensive applications. We will explore what different tools have in common, what distinguishes them, and how they achieve their characteristics.</p><p>In this chapter, we will start by exploring the fundamentals of what we are trying to achieve: reliable, scalable, and maintainable data systems. We’ll clarify what those things mean, outline some ways of thinking about them, and go over the basics that we will need for later chapters. In the following chapters we will continue layer by layer, looking at different design decisions that need to be considered when working on a data-intensive application.</p><h2 id="" tabindex="-1">…… <a class="header-anchor" href="#" aria-label="Permalink to &quot;……&quot;">​</a></h2><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;Summary&quot;">​</a></h2><p>In this chapter, we have explored some fundamental ways of thinking about data-intensive applications. These principles will guide us through the rest of the book, where we dive into deep technical detail.</p><p>An application has to meet various requirements in order to be useful. There are <em>functional requirements</em> (what it should do, such as allowing data to be stored, retrieved, searched, and processed in various ways), and some <em>nonfunctional require‐ ments</em> (general properties like security, reliability, compliance, scalability, compatibil‐ ity, and maintainability). In this chapter we discussed reliability, scalability, and maintainability in detail.</p><p><em>Reliability</em> means making systems work correctly, even when faults occur. Faults can be in hardware (typically random and uncorrelated), software (bugs are typically sys‐ tematic and hard to deal with), and humans (who inevitably make mistakes from time to time). Fault-tolerance techniques can hide certain types of faults from the end user.</p><p><em>Scalability</em> means having strategies for keeping performance good, even when load increases. In order to discuss scalability, we first need ways of describing load and performance quantitatively. We briefly looked at Twitter’s home timelines as an example of describing load, and response time percentiles as a way of measuring performance. In a scalable system, you can add processing capacity in order to remain reliable under high load.</p><p><em>Maintainability</em> has many facets, but in essence it’s about making life better for the engineering and operations teams who need to work with the system. Good abstrac‐ tions can help reduce complexity and make the system easier to modify and adapt for new use cases. Good operability means having good visibility into the system’s health, and having effective ways of managing it.</p><p>There is unfortunately no easy fix for making applications reliable, scalable, or main‐ tainable. However, there are certain patterns and techniques that keep reappearing in different kinds of applications. In the next few chapters we will take a look at some examples of data systems and analyze how they work toward those goals.</p><p>Later in the book, in <a href="./part-iii.html">Part III</a>, we will look at patterns for systems that consist of sev‐ eral components working together, such as the one in <a href="../img/fig1-1.png">Figure 1-1</a>.</p><h2 id="references" tabindex="-1">References <a class="header-anchor" href="#references" aria-label="Permalink to &quot;References&quot;">​</a></h2><hr><ol><li><p>Michael Stonebraker and Uğur Çetintemel: “<a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.68.9136&amp;rep=rep1&amp;type=pdf" target="_blank" rel="noreferrer">&#39;One Size Fits All&#39;: An Idea Whose Time Has Come and Gone</a>,” at <em>21st International Conference on Data Engineering</em> (ICDE), April 2005.</p></li><li><p>Walter L. Heimerdinger and Charles B. Weinstock: “<a href="http://www.sei.cmu.edu/reports/92tr033.pdf" target="_blank" rel="noreferrer">A Conceptual Framework for System Fault Tolerance</a>,” Technical Report CMU/SEI-92-TR-033, Software Engineering Institute, Carnegie Mellon University, October 1992.</p></li><li><p>Ding Yuan, Yu Luo, Xin Zhuang, et al.: “<a href="https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-yuan.pdf" target="_blank" rel="noreferrer">Simple Testing Can Prevent Most Critical Failures: An Analysis of Production Failures in Distributed Data-Intensive Systems</a>,” at <em>11th USENIX Symposium on Operating Systems Design and Implementation</em> (OSDI), October 2014.</p></li><li><p>Yury Izrailevsky and Ariel Tseitlin: “<a href="http://techblog.netflix.com/2011/07/netflix-simian-army.html" target="_blank" rel="noreferrer">The Netflix Simian Army</a>,” <em>techblog.netflix.com</em>, July 19, 2011.</p></li><li><p>Daniel Ford, François Labelle, Florentina I. Popovici, et al.: “<a href="http://research.google.com/pubs/archive/36737.pdf" target="_blank" rel="noreferrer">Availability in Globally Distributed Storage Systems</a>,” at <em>9th USENIX Symposium on Operating Systems Design and Implementation</em> (OSDI), October 2010.</p></li><li><p>Brian Beach: “<a href="https://www.backblaze.com/blog/hard-drive-reliability-update-september-2014/" target="_blank" rel="noreferrer">Hard Drive Reliability Update – Sep 2014</a>,” <em>backblaze.com</em>, September 23, 2014.</p></li><li><p>Laurie Voss: “<a href="https://web.archive.org/web/20160429075023/http://blog.awe.sm/2012/12/18/aws-the-good-the-bad-and-the-ugly/" target="_blank" rel="noreferrer">AWS: The Good, the Bad and the Ugly</a>,” <em>blog.awe.sm</em>, December 18, 2012.</p></li><li><p>Haryadi S. Gunawi, Mingzhe Hao, Tanakorn Leesatapornwongsa, et al.: “<a href="http://ucare.cs.uchicago.edu/pdf/socc14-cbs.pdf" target="_blank" rel="noreferrer">What Bugs Live in the Cloud?</a>,” at <em>5th ACM Symposium on Cloud Computing</em> (SoCC), November 2014. <a href="http://dx.doi.org/10.1145/2670979.2670986" target="_blank" rel="noreferrer">doi:10.1145/2670979.2670986</a></p></li><li><p>Nelson Minar: “<a href="http://www.somebits.com/weblog/tech/bad/leap-second-2012.html" target="_blank" rel="noreferrer">Leap Second Crashes Half the Internet</a>,” <em>somebits.com</em>, July 3, 2012.</p></li><li><p>Amazon Web Services: “<a href="http://aws.amazon.com/message/65648/" target="_blank" rel="noreferrer">Summary of the Amazon EC2 and Amazon RDS Service Disruption in the US East Region</a>,” <em>aws.amazon.com</em>, April 29, 2011.</p></li><li><p>Richard I. Cook: “<a href="http://web.mit.edu/2.75/resources/random/How%20Complex%20Systems%20Fail.pdf" target="_blank" rel="noreferrer">How Complex Systems Fail</a>,” Cognitive Technologies Laboratory, April 2000.</p></li><li><p>Jay Kreps: “<a href="http://blog.empathybox.com/post/19574936361/getting-real-about-distributed-system-reliability" target="_blank" rel="noreferrer">Getting Real About Distributed System Reliability</a>,” <em>blog.empathybox.com</em>, March 19, 2012.</p></li><li><p>David Oppenheimer, Archana Ganapathi, and David A. Patterson: “<a href="http://static.usenix.org/legacy/events/usits03/tech/full_papers/oppenheimer/oppenheimer.pdf" target="_blank" rel="noreferrer">Why Do Internet Services Fail, and What Can Be Done About It?</a>,” at <em>4th USENIX Symposium on Internet Technologies and Systems</em> (USITS), March 2003.</p></li><li><p>Nathan Marz: “<a href="http://nathanmarz.com/blog/principles-of-software-engineering-part-1.html" target="_blank" rel="noreferrer">Principles of Software Engineering, Part 1</a>,” <em>nathanmarz.com</em>, April 2, 2013.</p></li><li><p>Michael Jurewitz:“<a href="http://jury.me/blog/2013/3/14/the-human-impact-of-bugs" target="_blank" rel="noreferrer">The Human Impact of Bugs</a>,” <em>jury.me</em>, March 15, 2013.</p></li><li><p>Raffi Krikorian: “<a href="http://www.infoq.com/presentations/Twitter-Timeline-Scalability" target="_blank" rel="noreferrer">Timelines at Scale</a>,” at <em>QCon San Francisco</em>, November 2012.</p></li><li><p>Martin Fowler: <em>Patterns of Enterprise Application Architecture</em>. Addison Wesley, 2002. ISBN: 978-0-321-12742-6</p></li><li><p>Kelly Sommers: “<a href="https://twitter.com/kellabyte/status/532930540777635840" target="_blank" rel="noreferrer">After all that run around, what caused 500ms disk latency even when we replaced physical server?</a>” <em>twitter.com</em>, November 13, 2014.</p></li><li><p>Giuseppe DeCandia, Deniz Hastorun, Madan Jampani, et al.: “<a href="http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" target="_blank" rel="noreferrer">Dynamo: Amazon&#39;s Highly Available Key-Value Store</a>,” at <em>21st ACM Symposium on Operating Systems Principles</em> (SOSP), October 2007.</p></li><li><p>Greg Linden: “<a href="http://glinden.blogspot.co.uk/2006/12/slides-from-my-talk-at-stanford.html" target="_blank" rel="noreferrer">Make Data Useful</a>,” slides from presentation at Stanford University Data Mining class (CS345), December 2006.</p></li><li><p>Tammy Everts: “<a href="http://www.webperformancetoday.com/2014/11/12/real-cost-slow-time-vs-downtime-slides/" target="_blank" rel="noreferrer">The Real Cost of Slow Time vs Downtime</a>,” <em>webperformancetoday.com</em>, November 12, 2014.</p></li><li><p>Jake Brutlag:“<a href="http://googleresearch.blogspot.co.uk/2009/06/speed-matters.html" target="_blank" rel="noreferrer">Speed Matters for Google Web Search</a>,” <em>googleresearch.blogspot.co.uk</em>, June 22, 2009.</p></li><li><p>Tyler Treat: “<a href="http://bravenewgeek.com/everything-you-know-about-latency-is-wrong/" target="_blank" rel="noreferrer">Everything You Know About Latency Is Wrong</a>,” <em>bravenewgeek.com</em>, December 12, 2015.</p></li><li><p>Jeffrey Dean and Luiz André Barroso: “<a href="http://cacm.acm.org/magazines/2013/2/160173-the-tail-at-scale/fulltext" target="_blank" rel="noreferrer">The Tail at Scale</a>,” <em>Communications of the ACM</em>, volume 56, number 2, pages 74–80, February 2013. <a href="http://dx.doi.org/10.1145/2408776.2408794" target="_blank" rel="noreferrer">doi:10.1145/2408776.2408794</a></p></li><li><p>Graham Cormode, Vladislav Shkapenyuk, Divesh Srivastava, and Bojian Xu: “<a href="http://dimacs.rutgers.edu/~graham/pubs/papers/fwddecay.pdf" target="_blank" rel="noreferrer">Forward Decay: A Practical Time Decay Model for Streaming Systems</a>,” at <em>25th IEEE International Conference on Data Engineering</em> (ICDE), March 2009.</p></li><li><p>Ted Dunning and Otmar Ertl: “<a href="https://github.com/tdunning/t-digest" target="_blank" rel="noreferrer">Computing Extremely Accurate Quantiles Using t-Digests</a>,” <em>github.com</em>, March 2014.</p></li><li><p>Gil Tene: “<a href="http://www.hdrhistogram.org/" target="_blank" rel="noreferrer">HdrHistogram</a>,” <em>hdrhistogram.org</em>.</p></li><li><p>Baron Schwartz: “<a href="https://www.vividcortex.com/blog/why-percentiles-dont-work-the-way-you-think" target="_blank" rel="noreferrer">Why Percentiles Don’t Work the Way You Think</a>,” <em>vividcortex.com</em>, December 7, 2015.</p></li><li><p>James Hamilton: “<a href="https://www.usenix.org/legacy/events/lisa07/tech/full_papers/hamilton/hamilton.pdf" target="_blank" rel="noreferrer">On Designing and Deploying Internet-Scale Services</a>,” at <em>21st Large Installation System Administration Conference</em> (LISA), November 2007.</p></li><li><p>Brian Foote and Joseph Yoder: “<a href="http://www.laputan.org/pub/foote/mud.pdf" target="_blank" rel="noreferrer">Big Ball of Mud</a>,” at <em>4th Conference on Pattern Languages of Programs</em> (PLoP), September 1997.</p></li><li><p>Frederick P Brooks: “No Silver Bullet – Essence and Accident in Software Engineering,” in <em>The Mythical Man-Month</em>, Anniversary edition, Addison-Wesley, 1995. ISBN: 978-0-201-83595-3</p></li><li><p>Ben Moseley and Peter Marks: “<a href="http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.93.8928" target="_blank" rel="noreferrer">Out of the Tar Pit</a>,” at <em>BCS Software Practice Advancement</em> (SPA), 2006.</p></li><li><p>Rich Hickey: “<a href="http://www.infoq.com/presentations/Simple-Made-Easy" target="_blank" rel="noreferrer">Simple Made Easy</a>,” at <em>Strange Loop</em>, September 2011.</p></li><li><p>Hongyu Pei Breivold, Ivica Crnkovic, and Peter J. Eriksson: “<a href="http://www.mrtc.mdh.se/publications/1478.pdf" target="_blank" rel="noreferrer">Analyzing Software Evolvability</a>,” at <em>32nd Annual IEEE International Computer Software and Applications Conference</em> (COMPSAC), July 2008. <a href="http://dx.doi.org/10.1109/COMPSAC.2008.50" target="_blank" rel="noreferrer">doi:10.1109/COMPSAC.2008.50</a></p></li></ol>',23),l=[o];function s(m,h,p,c,d,f){return r(),t("div",null,l)}const y=a(n,[["render",s]]);export{b as __pageData,y as default};
