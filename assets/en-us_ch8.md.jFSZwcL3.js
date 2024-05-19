import{_ as e}from"./chunks/ch8.BiqB2qLJ.js";import{_ as a,c as r,o as t,a1 as o}from"./chunks/framework.biRBrEtS.js";const b=JSON.parse('{"title":"8. The Trouble with Distributed Systems","description":"","frontmatter":{},"headers":[],"relativePath":"en-us/ch8.md","filePath":"en-us/ch8.md"}'),n={name:"en-us/ch8.md"},i=o('<h1 id="_8-the-trouble-with-distributed-systems" tabindex="-1">8. The Trouble with Distributed Systems <a class="header-anchor" href="#_8-the-trouble-with-distributed-systems" aria-label="Permalink to &quot;8. The Trouble with Distributed Systems&quot;">​</a></h1><p><img src="'+e+'" alt=""></p><blockquote><p><em>Hey I just met you</em><em>The network’s laggy</em><em>But here’s my data</em><em>So store it maybe</em></p><p>​ — Kyle Kingsbury, <em>Carly Rae Jepsen and the Perils of Network Partitions</em> (2013)</p></blockquote><hr><p>A recurring theme in the last few chapters has been how systems handle things going wrong. For example, we discussed replica failover (“<a href="./ch5.html#handing-node-outages">Handling Node Outages</a>”), replication lag (“<a href="./ch5.html#problems-with-replication-lag">Problems with Replication Lag</a>”), and con‐ currency control for transactions (“<a href="./ch7.html#weak-isolation-levels">Weak Isolation Levels</a>”). As we come to understand various edge cases that can occur in real systems, we get better at handling them.</p><p>However, even though we have talked a lot about faults, the last few chapters have still been too optimistic. The reality is even darker. We will now turn our pessimism to the maximum and assume that anything that <em>can</em> go wrong <em>will</em> go wrong.[^i] (Experienced systems operators will tell you that is a reasonable assumption. If you ask nicely, they might tell you some frightening stories while nursing their scars of past battles.)</p><p>[^i]: With one exception: we will assume that faults are <em>non-Byzantine</em> (see “<a href="./ch8.html#byzantine-faults">Byzantine Faults</a>”).</p><p>Working with distributed systems is fundamentally different from writing software on a single computer—and the main difference is that there are lots of new and excit‐ ing ways for things to go wrong [1, 2]. In this chapter, we will get a taste of the prob‐ lems that arise in practice, and an understanding of the things we can and cannot rely on.</p><p>In the end, our task as engineers is to build systems that do their job (i.e., meet the guarantees that users are expecting), in spite of everything going wrong. In <a href="./ch9.html">Chapter 9</a>, we will look at some examples of algorithms that can provide such guarantees in a distributed system. But first, in this chapter, we must understand what challenges we are up against.</p><p>This chapter is a thoroughly pessimistic and depressing overview of things that may go wrong in a distributed system. We will look into problems with networks (“<a href="#unreliable-networks">Unreliable Networks</a>”); clocks and timing issues (“<a href="#unreliable-clocks">Unreliable Clocks</a>”); and we’ll discuss to what degree they are avoidable. The consequences of all these issues are disorienting, so we’ll explore how to think about the state of a dis‐ tributed system and how to reason about things that have happened (“<a href="#knowledge-truth-and-lies">Knowledge, Truth, and Lies</a>”).</p><h2 id="" tabindex="-1">…… <a class="header-anchor" href="#" aria-label="Permalink to &quot;……&quot;">​</a></h2><h2 id="summary" tabindex="-1">Summary <a class="header-anchor" href="#summary" aria-label="Permalink to &quot;Summary&quot;">​</a></h2><p>In this chapter we have discussed a wide range of problems that can occur in dis‐ tributed systems, including:</p><ul><li>Whenever you try to send a packet over the network, it may be lost or arbitrarily delayed. Likewise, the reply may be lost or delayed, so if you don’t get a reply, you have no idea whether the message got through.</li><li>A node’s clock may be significantly out of sync with other nodes (despite your best efforts to set up NTP), it may suddenly jump forward or back in time, and relying on it is dangerous because you most likely don’t have a good measure of your clock’s error interval.</li><li>A process may pause for a substantial amount of time at any point in its execu‐ tion (perhaps due to a stop-the-world garbage collector), be declared dead by other nodes, and then come back to life again without realizing that it was paused.</li></ul><p>The fact that such <em>partial failures</em> can occur is the defining characteristic of dis‐ tributed systems. Whenever software tries to do anything involving other nodes, there is the possibility that it may occasionally fail, or randomly go slow, or not respond at all (and eventually time out). In distributed systems, we try to build tolerance of partial failures into software, so that the system as a whole may continue functioning even when some of its constituent parts are broken.</p><p>To tolerate faults, the first step is to <em>detect</em> them, but even that is hard. Most systems don’t have an accurate mechanism of detecting whether a node has failed, so most distributed algorithms rely on timeouts to determine whether a remote node is still available. However, timeouts can’t distinguish between network and node failures, and variable network delay sometimes causes a node to be falsely suspected of crash‐ ing. Moreover, sometimes a node can be in a degraded state: for example, a Gigabit network interface could suddenly drop to 1 Kb/s throughput due to a driver bug [94]. Such a node that is “limping” but not dead can be even more difficult to deal with than a cleanly failed node.</p><p>Once a fault is detected, making a system tolerate it is not easy either: there is no global variable, no shared memory, no common knowledge or any other kind of shared state between the machines. Nodes can’t even agree on what time it is, let alone on anything more profound. The only way information can flow from one node to another is by sending it over the unreliable network. Major decisions cannot be safely made by a single node, so we require protocols that enlist help from other nodes and try to get a quorum to agree.</p><p>If you’re used to writing software in the idealized mathematical perfection of a single computer, where the same operation always deterministically returns the same result, then moving to the messy physical reality of distributed systems can be a bit of a shock. Conversely, distributed systems engineers will often regard a problem as triv‐ ial if it can be solved on a single computer [5], and indeed a single computer can do a lot nowadays [95]. If you can avoid opening Pandora’s box and simply keep things on a single machine, it is generally worth doing so.</p><p>However, as discussed in the introduction to <a href="./part-ii.html">Part II</a>, scalability is not the only reason for wanting to use a distributed system. Fault tolerance and low latency (by placing data geographically close to users) are equally important goals, and those things can‐ not be achieved with a single node.</p><p>In this chapter we also went on some tangents to explore whether the unreliability of networks, clocks, and processes is an inevitable law of nature. We saw that it isn’t: it is possible to give hard real-time response guarantees and bounded delays in net‐ works, but doing so is very expensive and results in lower utilization of hardware resources. Most non-safety-critical systems choose cheap and unreliable over expen‐ sive and reliable.</p><p>We also touched on supercomputers, which assume reliable components and thus have to be stopped and restarted entirely when a component does fail. By contrast, distributed systems can run forever without being interrupted at the service level, because all faults and maintenance can be handled at the node level—at least in theory. (In practice, if a bad configuration change is rolled out to all nodes, that will still bring a distributed system to its knees.)</p><p>This chapter has been all about problems, and has given us a bleak outlook. In the next chapter we will move on to solutions, and discuss some algorithms that have been designed to cope with all the problems in distributed systems.</p><h2 id="references" tabindex="-1">References <a class="header-anchor" href="#references" aria-label="Permalink to &quot;References&quot;">​</a></h2><hr><ol><li>Mark Cavage: Just No Getting Around It: You’re Building a Distributed System](<a href="http://queue.acm.org/detail.cfm?id=2482856" target="_blank" rel="noreferrer">http://queue.acm.org/detail.cfm?id=2482856</a>),” <em>ACM Queue</em>, volume 11, number 4, pages 80-89, April 2013. <a href="http://dx.doi.org/10.1145/2466486.2482856" target="_blank" rel="noreferrer">doi:10.1145/2466486.2482856</a></li><li>Jay Kreps: “<a href="http://blog.empathybox.com/post/19574936361/getting-real-about-distributed-system-reliability" target="_blank" rel="noreferrer">Getting Real About Distributed System Reliability</a>,” <em>blog.empathybox.com</em>, March 19, 2012.</li><li>Sydney Padua: <em>The Thrilling Adventures of Lovelace and Babbage: The (Mostly) True Story of the First Computer</em>. Particular Books, April ISBN: 978-0-141-98151-2</li><li>Coda Hale: “<a href="http://codahale.com/you-cant-sacrifice-partition-tolerance/" target="_blank" rel="noreferrer">You Can’t Sacrifice Partition Tolerance</a>,” <em>codahale.com</em>, October 7, 2010.</li><li>Jeff Hodges: “<a href="http://www.somethingsimilar.com/2013/01/14/notes-on-distributed-systems-for-young-bloods/" target="_blank" rel="noreferrer">Notes on Distributed Systems for Young Bloods</a>,” <em>somethingsimilar.com</em>, January 14, 2013.</li><li>Antonio Regalado: “<a href="http://www.technologyreview.com/news/425970/who-coined-cloud-computing/" target="_blank" rel="noreferrer">Who Coined &#39;Cloud Computing’?</a>,” <em>technologyreview.com</em>, October 31, 2011.</li><li>Luiz André Barroso, Jimmy Clidaras, and Urs Hölzle: “<a href="http://www.morganclaypool.com/doi/abs/10.2200/S00516ED2V01Y201306CAC024" target="_blank" rel="noreferrer">The Datacenter as a Computer: An Introduction to the Design of Warehouse-Scale Machines, Second Edition</a>,” <em>Synthesis Lectures on Computer Architecture</em>, volume 8, number 3, Morgan &amp; Claypool Publishers, July 2013.<a href="http://dx.doi.org/10.2200/S00516ED2V01Y201306CAC024" target="_blank" rel="noreferrer">doi:10.2200/S00516ED2V01Y201306CAC024</a>, ISBN: 978-1-627-05010-4</li><li>David Fiala, Frank Mueller, Christian Engelmann, et al.: “<a href="http://moss.csc.ncsu.edu/~mueller/ftp/pub/mueller/papers/sc12.pdf" target="_blank" rel="noreferrer">Detection and Correction of Silent Data Corruption for Large-Scale High-Performance Computing</a>,” at <em>International Conference for High Performance Computing, Networking, Storage and Analysis</em> (SC12), November 2012.</li><li>Arjun Singh, Joon Ong, Amit Agarwal, et al.: “<a href="http://conferences.sigcomm.org/sigcomm/2015/pdf/papers/p183.pdf" target="_blank" rel="noreferrer">Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network</a>,” at <em>Annual Conference of the ACM Special Interest Group on Data Communication</em> (SIGCOMM), August 2015. <a href="http://dx.doi.org/10.1145/2785956.2787508" target="_blank" rel="noreferrer">doi:10.1145/2785956.2787508</a></li><li>Glenn K. Lockwood: “<a href="http://glennklockwood.blogspot.co.uk/2014/05/hadoops-uncomfortable-fit-in-hpc.html" target="_blank" rel="noreferrer">Hadoop&#39;s Uncomfortable Fit in HPC</a>,” <em>glennklockwood.blogspot.co.uk</em>, May 16, 2014.</li><li>John von Neumann: “<a href="https://ece.uwaterloo.ca/~ssundara/courses/prob_logics.pdf" target="_blank" rel="noreferrer">Probabilistic Logics and the Synthesis of Reliable Organisms from Unreliable Components</a>,” in <em>Automata Studies (AM-34)</em>, edited by Claude E. Shannon and John McCarthy, Princeton University Press, 1956. ISBN: 978-0-691-07916-5</li><li>Richard W. Hamming: <em>The Art of Doing Science and Engineering</em>. Taylor &amp; Francis, 1997. ISBN: 978-9-056-99500-3</li><li>Claude E. Shannon: “<a href="http://cs.brynmawr.edu/Courses/cs380/fall2012/shannon1948.pdf" target="_blank" rel="noreferrer">A Mathematical Theory of Communication</a>,” <em>The Bell System Technical Journal</em>, volume 27, number 3, pages 379–423 and 623–656, July 1948.</li><li>Peter Bailis and Kyle Kingsbury: “<a href="https://queue.acm.org/detail.cfm?id=2655736" target="_blank" rel="noreferrer">The Network Is Reliable</a>,” <em>ACM Queue</em>, volume 12, number 7, pages 48-55, July 2014. <a href="http://dx.doi.org/10.1145/2639988.2639988" target="_blank" rel="noreferrer">doi:10.1145/2639988.2639988</a></li><li>Joshua B. Leners, Trinabh Gupta, Marcos K. Aguilera, and Michael Walfish: “<a href="http://www.cs.nyu.edu/~mwalfish/papers/albatross-eurosys15.pdf" target="_blank" rel="noreferrer">Taming Uncertainty in Distributed Systems with Help from the Network</a>,” at <em>10th European Conference on Computer Systems</em> (EuroSys), April 2015. <a href="http://dx.doi.org/10.1145/2741948.2741976" target="_blank" rel="noreferrer">doi:10.1145/2741948.2741976</a></li><li>Phillipa Gill, Navendu Jain, and Nachiappan Nagappan: “<a href="http://conferences.sigcomm.org/sigcomm/2011/papers/sigcomm/p350.pdf" target="_blank" rel="noreferrer">Understanding Network Failures in Data Centers: Measurement, Analysis, and Implications</a>,” at <em>ACM SIGCOMM Conference</em>, August 2011. <a href="http://dx.doi.org/10.1145/2018436.2018477" target="_blank" rel="noreferrer">doi:10.1145/2018436.2018477</a></li><li>Mark Imbriaco: “<a href="https://github.com/blog/1364-downtime-last-saturday" target="_blank" rel="noreferrer">Downtime Last Saturday</a>,” <em>github.com</em>, December 26, 2012.</li><li>Will Oremus: “<a href="http://www.slate.com/blogs/future_tense/2014/08/15/shark_attacks_threaten_google_s_undersea_internet_cables_video.html" target="_blank" rel="noreferrer">The Global Internet Is Being Attacked by Sharks, Google Confirms</a>,” <em>slate.com</em>, August 15, 2014.</li><li>Marc A. Donges: “<a href="http://www.spinics.net/lists/netdev/msg210485.html" target="_blank" rel="noreferrer">Re: bnx2 cards Intermittantly Going Offline</a>,” Message to Linux <em>netdev</em> mailing list, <em>spinics.net</em>, September 13, 2012.</li><li>Kyle Kingsbury: “<a href="https://aphyr.com/posts/317-call-me-maybe-elasticsearch" target="_blank" rel="noreferrer">Call Me Maybe: Elasticsearch</a>,” <em>aphyr.com</em>, June 15, 2014.</li><li>Salvatore Sanfilippo: “<a href="http://antirez.com/news/80" target="_blank" rel="noreferrer">A Few Arguments About Redis Sentinel Properties and Fail Scenarios</a>,” <em>antirez.com</em>, October 21, 2014.</li><li>Bert Hubert: “<a href="http://blog.netherlabs.nl/articles/2009/01/18/the-ultimate-so_linger-page-or-why-is-my-tcp-not-reliable" target="_blank" rel="noreferrer">The Ultimate SO_LINGER Page, or: Why Is My TCP Not Reliable</a>,” <em>blog.netherlabs.nl</em>, January 18, 2009.</li><li>Nicolas Liochon: “<a href="http://blog.thislongrun.com/2015/05/CAP-theorem-partition-timeout-zookeeper.html" target="_blank" rel="noreferrer">CAP: If All You Have Is a Timeout, Everything Looks Like a Partition</a>,” <em>blog.thislongrun.com</em>, May 25, 2015.</li><li>Jerome H. Saltzer, David P. Reed, and David D. Clark: “<a href="http://www.ece.drexel.edu/courses/ECE-C631-501/SalRee1984.pdf" target="_blank" rel="noreferrer">End-To-End Arguments in System Design</a>,” <em>ACM Transactions on Computer Systems</em>, volume 2, number 4, pages 277–288, November 1984. <a href="http://dx.doi.org/10.1145/357401.357402" target="_blank" rel="noreferrer">doi:10.1145/357401.357402</a></li><li>Matthew P. Grosvenor, Malte Schwarzkopf, Ionel Gog, et al.: “<a href="https://www.usenix.org/system/files/conference/nsdi15/nsdi15-paper-grosvenor_update.pdf" target="_blank" rel="noreferrer">Queues Don’t Matter When You Can JUMP Them!</a>,” at <em>12th USENIX Symposium on Networked Systems Design and Implementation</em> (NSDI), May 2015.</li><li>Guohui Wang and T. S. Eugene Ng: “<a href="http://www.cs.rice.edu/~eugeneng/papers/INFOCOM10-ec2.pdf" target="_blank" rel="noreferrer">The Impact of Virtualization on Network Performance of Amazon EC2 Data Center</a>,” at <em>29th IEEE International Conference on Computer Communications</em> (INFOCOM), March 2010. <a href="http://dx.doi.org/10.1109/INFCOM.2010.5461931" target="_blank" rel="noreferrer">doi:10.1109/INFCOM.2010.5461931</a></li><li>Van Jacobson: “<a href="http://www.cs.usask.ca/ftp/pub/discus/seminars2002-2003/p314-jacobson.pdf" target="_blank" rel="noreferrer">Congestion Avoidance and Control</a>,” at <em>ACM Symposium on Communications Architectures and Protocols</em> (SIGCOMM), August 1988. <a href="http://dx.doi.org/10.1145/52324.52356" target="_blank" rel="noreferrer">doi:10.1145/52324.52356</a></li><li>Brandon Philips: “<a href="https://www.youtube.com/watch?v=HJIjTTHWYnE" target="_blank" rel="noreferrer">etcd: Distributed Locking and Service Discovery</a>,” at <em>Strange Loop</em>, September 2014.</li><li>Steve Newman: “<a href="http://blog.scalyr.com/2012/10/a-systematic-look-at-ec2-io/" target="_blank" rel="noreferrer">A Systematic Look at EC2 I/O</a>,” <em>blog.scalyr.com</em>, October 16, 2012.</li><li>Naohiro Hayashibara, Xavier Défago, Rami Yared, and Takuya Katayama: “<a href="http://hdl.handle.net/10119/4784" target="_blank" rel="noreferrer">The ϕ Accrual Failure Detector</a>,” Japan Advanced Institute of Science and Technology, School of Information Science, Technical Report IS-RR-2004-010, May 2004.</li><li>Jeffrey Wang: “<a href="http://ternarysearch.blogspot.co.uk/2013/08/phi-accrual-failure-detector.html" target="_blank" rel="noreferrer">Phi Accrual Failure Detector</a>,” <em>ternarysearch.blogspot.co.uk</em>, August 11, 2013.</li><li>Srinivasan Keshav: <em>An Engineering Approach to Computer Networking: ATM Networks, the Internet, and the Telephone Network</em>. Addison-Wesley Professional, May 1997. ISBN: 978-0-201-63442-6</li><li>Cisco, “<a href="http://docwiki.cisco.com/wiki/Integrated_Services_Digital_Network" target="_blank" rel="noreferrer">Integrated Services Digital Network</a>,” <em>docwiki.cisco.com</em>.</li><li>Othmar Kyas: <em>ATM Networks</em>. International Thomson Publishing, 1995. ISBN: 978-1-850-32128-6</li><li>“<a href="http://www.mellanox.com/related-docs/whitepapers/InfiniBandFAQ_FQ_100.pdf" target="_blank" rel="noreferrer">InfiniBand FAQ</a>,” Mellanox Technologies, December 22, 2014.</li><li>Jose Renato Santos, Yoshio Turner, and G. (John) Janakiraman: “<a href="http://www.hpl.hp.com/techreports/2002/HPL-2002-359.pdf" target="_blank" rel="noreferrer">End-to-End Congestion Control for InfiniBand</a>,” at <em>22nd Annual Joint Conference of the IEEE Computer and Communications Societies</em> (INFOCOM), April 2003. Also published by HP Laboratories Palo Alto, Tech Report HPL-2002-359. <a href="http://dx.doi.org/10.1109/INFCOM.2003.1208949" target="_blank" rel="noreferrer">doi:10.1109/INFCOM.2003.1208949</a></li><li>Ulrich Windl, David Dalton, Marc Martinec, and Dale R. Worley: “<a href="http://www.ntp.org/ntpfaq/NTP-a-faq.htm" target="_blank" rel="noreferrer">The NTP FAQ and HOWTO</a>,” <em>ntp.org</em>, November 2006.</li><li>John Graham-Cumming: “<a href="https://blog.cloudflare.com/how-and-why-the-leap-second-affected-cloudflare-dns/" target="_blank" rel="noreferrer">How and why the leap second affected Cloudflare DNS</a>,” <em>blog.cloudflare.com</em>, January 1, 2017.</li><li>David Holmes: “<a href="https://blogs.oracle.com/dholmes/entry/inside_the_hotspot_vm_clocks" target="_blank" rel="noreferrer">Inside the Hotspot VM: Clocks, Timers and Scheduling Events – Part I – Windows</a>,” <em>blogs.oracle.com</em>, October 2, 2006.</li><li>Steve Loughran: “<a href="http://steveloughran.blogspot.co.uk/2015/09/time-on-multi-core-multi-socket-servers.html" target="_blank" rel="noreferrer">Time on Multi-Core, Multi-Socket Servers</a>,” <em>steveloughran.blogspot.co.uk</em>, September 17, 2015.</li><li>James C. Corbett, Jeffrey Dean, Michael Epstein, et al.: “<a href="http://research.google.com/archive/spanner.html" target="_blank" rel="noreferrer">Spanner: Google’s Globally-Distributed Database</a>,” at <em>10th USENIX Symposium on Operating System Design and Implementation</em> (OSDI), October 2012.</li><li>M. Caporaloni and R. Ambrosini: “<a href="https://iopscience.iop.org/0143-0807/23/4/103/" target="_blank" rel="noreferrer">How Closely Can a Personal Computer Clock Track the UTC Timescale Via the Internet?</a>,” <em>European Journal of Physics</em>, volume 23, number 4, pages L17–L21, June 2012. <a href="http://dx.doi.org/10.1088/0143-0807/23/4/103" target="_blank" rel="noreferrer">doi:10.1088/0143-0807/23/4/103</a></li><li>Nelson Minar: “<a href="http://alumni.media.mit.edu/~nelson/research/ntp-survey99/" target="_blank" rel="noreferrer">A Survey of the NTP Network</a>,” <em>alumni.media.mit.edu</em>, December 1999.</li><li>Viliam Holub: “<a href="https://blog.logentries.com/2014/03/synchronizing-clocks-in-a-cassandra-cluster-pt-1-the-problem/" target="_blank" rel="noreferrer">Synchronizing Clocks in a Cassandra Cluster Pt. 1 – The Problem</a>,” <em>blog.logentries.com</em>, March 14, 2014.</li><li>Poul-Henning Kamp: “<a href="http://queue.acm.org/detail.cfm?id=1967009" target="_blank" rel="noreferrer">The One-Second War (What Time Will You Die?)</a>,” <em>ACM Queue</em>, volume 9, number 4, pages 44–48, April 2011. <a href="http://dx.doi.org/10.1145/1966989.1967009" target="_blank" rel="noreferrer">doi:10.1145/1966989.1967009</a></li><li>Nelson Minar: “<a href="http://www.somebits.com/weblog/tech/bad/leap-second-2012.html" target="_blank" rel="noreferrer">Leap Second Crashes Half the Internet</a>,” <em>somebits.com</em>, July 3, 2012.</li><li>Christopher Pascoe: “<a href="http://googleblog.blogspot.co.uk/2011/09/time-technology-and-leaping-seconds.html" target="_blank" rel="noreferrer">Time, Technology and Leaping Seconds</a>,” <em>googleblog.blogspot.co.uk</em>, September 15, 2011.</li><li>Mingxue Zhao and Jeff Barr: “<a href="https://aws.amazon.com/blogs/aws/look-before-you-leap-the-coming-leap-second-and-aws/" target="_blank" rel="noreferrer">Look Before You Leap – The Coming Leap Second and AWS</a>,” <em>aws.amazon.com</em>, May 18, 2015.</li><li>Darryl Veitch and Kanthaiah Vijayalayan: “<a href="http://crin.eng.uts.edu.au/~darryl/Publications/LeapSecond_camera.pdf" target="_blank" rel="noreferrer">Network Timing and the 2015 Leap Second</a>,” at <em>17th International Conference on Passive and Active Measurement</em> (PAM), April 2016. <a href="http://dx.doi.org/10.1007/978-3-319-30505-9_29" target="_blank" rel="noreferrer">doi:10.1007/978-3-319-30505-9_29</a></li><li>“<a href="http://www.vmware.com/resources/techresources/238" target="_blank" rel="noreferrer">Timekeeping in VMware Virtual Machines</a>,” Information Guide, VMware, Inc., December 2011.</li><li>“<a href="https://www.esma.europa.eu/sites/default/files/library/2015/11/2015-esma-1464_annex_i_-_draft_rts_and_its_on_mifid_ii_and_mifir.pdf" target="_blank" rel="noreferrer">MiFID II / MiFIR: Regulatory Technical and Implementing Standards – Annex I (Draft)</a>,” European Securities and Markets Authority, Report ESMA/2015/1464, September 2015.</li><li>Luke Bigum: “<a href="https://www.lmax.com/blog/staff-blogs/2015/11/27/solving-mifid-ii-clock-synchronisation-minimum-spend-part-1/" target="_blank" rel="noreferrer">Solving MiFID II Clock Synchronisation With Minimum Spend (Part 1)</a>,” <em>lmax.com</em>, November 27, 2015.</li><li>Kyle Kingsbury: “<a href="https://aphyr.com/posts/294-call-me-maybe-cassandra/" target="_blank" rel="noreferrer">Call Me Maybe: Cassandra</a>,” <em>aphyr.com</em>, September 24, 2013.</li><li>John Daily: “<a href="http://basho.com/clocks-are-bad-or-welcome-to-distributed-systems/" target="_blank" rel="noreferrer">Clocks Are Bad, or, Welcome to the Wonderful World of Distributed Systems</a>,” <em>basho.com</em>, November 12, 2013.</li><li>Kyle Kingsbury: “<a href="https://aphyr.com/posts/299-the-trouble-with-timestamps" target="_blank" rel="noreferrer">The Trouble with Timestamps</a>,” <em>aphyr.com</em>, October 12, 2013.</li><li>Leslie Lamport: “<a href="http://research.microsoft.com/en-US/um/people/Lamport/pubs/time-clocks.pdf" target="_blank" rel="noreferrer">Time, Clocks, and the Ordering of Events in a Distributed System</a>,” <em>Communications of the ACM</em>, volume 21, number 7, pages 558–565, July 1978. <a href="http://dx.doi.org/10.1145/359545.359563" target="_blank" rel="noreferrer">doi:10.1145/359545.359563</a></li><li>Sandeep Kulkarni, Murat Demirbas, Deepak Madeppa, et al.: “<a href="http://www.cse.buffalo.edu/tech-reports/2014-04.pdf" target="_blank" rel="noreferrer">Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases</a>,” State University of New York at Buffalo, Computer Science and Engineering Technical Report 2014-04, May 2014.</li><li>Justin Sheehy: “<a href="https://queue.acm.org/detail.cfm?id=2745385" target="_blank" rel="noreferrer">There Is No Now: Problems With Simultaneity in Distributed Systems</a>,” <em>ACM Queue</em>, volume 13, number 3, pages 36–41, March 2015. <a href="http://dx.doi.org/10.1145/2733108" target="_blank" rel="noreferrer">doi:10.1145/2733108</a></li><li>Murat Demirbas: “<a href="http://muratbuffalo.blogspot.co.uk/2013/07/spanner-googles-globally-distributed_4.html" target="_blank" rel="noreferrer">Spanner: Google&#39;s Globally-Distributed Database</a>,” <em>muratbuffalo.blogspot.co.uk</em>, July 4, 2013.</li><li>Dahlia Malkhi and Jean-Philippe Martin: “<a href="http://www.cs.cornell.edu/~ie53/publications/DC-col51-Sep13.pdf" target="_blank" rel="noreferrer">Spanner&#39;s Concurrency Control</a>,” <em>ACM SIGACT News</em>, volume 44, number 3, pages 73–77, September 2013. <a href="http://dx.doi.org/10.1145/2527748.2527767" target="_blank" rel="noreferrer">doi:10.1145/2527748.2527767</a></li><li>Manuel Bravo, Nuno Diegues, Jingna Zeng, et al.: “<a href="http://sites.computer.org/debull/A15mar/p18.pdf" target="_blank" rel="noreferrer">On the Use of Clocks to Enforce Consistency in the Cloud</a>,” <em>IEEE Data Engineering Bulletin</em>, volume 38, number 1, pages 18–31, March 2015.</li><li>Spencer Kimball: “<a href="http://www.cockroachlabs.com/blog/living-without-atomic-clocks/" target="_blank" rel="noreferrer">Living Without Atomic Clocks</a>,” <em>cockroachlabs.com</em>, February 17, 2016.</li><li>Cary G. Gray and David R. Cheriton:“<a href="http://web.stanford.edu/class/cs240/readings/89-leases.pdf" target="_blank" rel="noreferrer">Leases: An Efficient Fault-Tolerant Mechanism for Distributed File Cache Consistency</a>,” at <em>12th ACM Symposium on Operating Systems Principles</em> (SOSP), December 1989. <a href="http://dx.doi.org/10.1145/74850.74870" target="_blank" rel="noreferrer">doi:10.1145/74850.74870</a></li><li>Todd Lipcon: “<a href="http://blog.cloudera.com/blog/2011/02/avoiding-full-gcs-in-hbase-with-memstore-local-allocation-buffers-part-1/" target="_blank" rel="noreferrer">Avoiding Full GCs in Apache HBase with MemStore-Local Allocation Buffers: Part 1</a>,” <em>blog.cloudera.com</em>, February 24, 2011.</li><li>Martin Thompson: “<a href="http://mechanical-sympathy.blogspot.co.uk/2013/07/java-garbage-collection-distilled.html" target="_blank" rel="noreferrer">Java Garbage Collection Distilled</a>,” <em>mechanical-sympathy.blogspot.co.uk</em>, July 16, 2013.</li><li>Alexey Ragozin: “<a href="http://java.dzone.com/articles/how-tame-java-gc-pauses" target="_blank" rel="noreferrer">How to Tame Java GC Pauses? Surviving 16GiB Heap and Greater</a>,” <em>java.dzone.com</em>, June 28, 2011.</li><li>Christopher Clark, Keir Fraser, Steven Hand, et al.: “<a href="http://www.cl.cam.ac.uk/research/srg/netos/papers/2005-nsdi-migration.pdf" target="_blank" rel="noreferrer">Live Migration of Virtual Machines</a>,” at <em>2nd USENIX Symposium on Symposium on Networked Systems Design &amp; Implementation</em> (NSDI), May 2005.</li><li>Mike Shaver: “<a href="http://shaver.off.net/diary/2008/05/25/fsyncers-and-curveballs/" target="_blank" rel="noreferrer">fsyncers and Curveballs</a>,” <em>shaver.off.net</em>, May 25, 2008.</li><li>Zhenyun Zhuang and Cuong Tran: “<a href="https://engineering.linkedin.com/blog/2016/02/eliminating-large-jvm-gc-pauses-caused-by-background-io-traffic" target="_blank" rel="noreferrer">Eliminating Large JVM GC Pauses Caused by Background IO Traffic</a>,” <em>engineering.linkedin.com</em>, February 10, 2016.</li><li>David Terei and Amit Levy: “<a href="http://arxiv.org/pdf/1504.02578.pdf" target="_blank" rel="noreferrer">Blade: A Data Center Garbage Collector</a>,” arXiv:1504.02578, April 13, 2015.</li><li>Martin Maas, Tim Harris, Krste Asanović, and John Kubiatowicz: “<a href="https://timharris.uk/papers/2015-hotos.pdf" target="_blank" rel="noreferrer">Trash Day: Coordinating Garbage Collection in Distributed Systems</a>,” at <em>15th USENIX Workshop on Hot Topics in Operating Systems</em> (HotOS), May 2015.</li><li>“<a href="http://cdn2.hubspot.net/hubfs/1624455/Website_2016/content/White%20papers/Cinnober%20on%20GC%20pause%20free%20Java%20applications.pdf" target="_blank" rel="noreferrer">Predictable Low Latency</a>,” Cinnober Financial Technology AB, <em>cinnober.com</em>, November 24, 2013.</li><li>Martin Fowler: “<a href="http://martinfowler.com/articles/lmax.html" target="_blank" rel="noreferrer">The LMAX Architecture</a>,” <em>martinfowler.com</em>, July 12, 2011.</li><li>Flavio P. Junqueira and Benjamin Reed: <em>ZooKeeper: Distributed Process Coordination</em>. O&#39;Reilly Media, 2013. ISBN: 978-1-449-36130-3</li><li>Enis Söztutar: “<a href="http://www.slideshare.net/enissoz/hbase-and-hdfs-understanding-filesystem-usage" target="_blank" rel="noreferrer">HBase and HDFS: Understanding Filesystem Usage in HBase</a>,” at <em>HBaseCon</em>, June 2013.</li><li>Caitie McCaffrey: “<a href="http://caitiem.com/2015/06/23/clients-are-jerks-aka-how-halo-4-dosed-the-services-at-launch-how-we-survived/" target="_blank" rel="noreferrer">Clients Are Jerks: AKA How Halo 4 DoSed the Services at Launch &amp; How We Survived</a>,” <em>caitiem.com</em>, June 23, 2015.</li><li>Leslie Lamport, Robert Shostak, and Marshall Pease: “<a href="http://research.microsoft.com/en-us/um/people/lamport/pubs/byz.pdf" target="_blank" rel="noreferrer">The Byzantine Generals Problem</a>,” <em>ACM Transactions on Programming Languages and Systems</em> (TOPLAS), volume 4, number 3, pages 382–401, July 1982. <a href="http://dx.doi.org/10.1145/357172.357176" target="_blank" rel="noreferrer">doi:10.1145/357172.357176</a></li><li>Jim N. Gray: “<a href="http://research.microsoft.com/en-us/um/people/gray/papers/DBOS.pdf" target="_blank" rel="noreferrer">Notes on Data Base Operating Systems</a>,” in <em>Operating Systems: An Advanced Course</em>, Lecture Notes in Computer Science, volume 60, edited by R. Bayer, R. M. Graham, and G. Seegmüller, pages 393–481, Springer-Verlag, 1978. ISBN: 978-3-540-08755-7</li><li>Brian Palmer: “<a href="http://www.slate.com/articles/news_and_politics/explainer/2011/10/the_byzantine_tax_code_how_complicated_was_byzantium_anyway_.html" target="_blank" rel="noreferrer">How Complicated Was the Byzantine Empire?</a>,” <em>slate.com</em>, October 20, 2011.</li><li>Leslie Lamport: “<a href="http://research.microsoft.com/en-us/um/people/lamport/pubs/pubs.html" target="_blank" rel="noreferrer">My Writings</a>,” <em>research.microsoft.com</em>, December 16, 2014. This page can be found by searching the web for the 23-character string obtained by removing the hyphens from the string <code>allla-mport-spubso-ntheweb</code>.</li><li>John Rushby: “<a href="http://www.csl.sri.com/papers/emsoft01/emsoft01.pdf" target="_blank" rel="noreferrer">Bus Architectures for Safety-Critical Embedded Systems</a>,” at <em>1st International Workshop on Embedded Software</em> (EMSOFT), October 2001.</li><li>Jake Edge: “<a href="http://lwn.net/Articles/540368/" target="_blank" rel="noreferrer">ELC: SpaceX Lessons Learned</a>,” <em>lwn.net</em>, March 6, 2013.</li><li>Andrew Miller and Joseph J. LaViola, Jr.: “<a href="http://nakamotoinstitute.org/static/docs/anonymous-byzantine-consensus.pdf" target="_blank" rel="noreferrer">Anonymous Byzantine Consensus from Moderately-Hard Puzzles: A Model for Bitcoin</a>,” University of Central Florida, Technical Report CS-TR-14-01, April 2014.</li><li>James Mickens: “<a href="https://www.usenix.org/system/files/login-logout_1305_mickens.pdf" target="_blank" rel="noreferrer">The Saddest Moment</a>,” <em>USENIX ;login: logout</em>, May 2013.</li><li>Evan Gilman: “<a href="http://www.pagerduty.com/blog/the-discovery-of-apache-zookeepers-poison-packet/" target="_blank" rel="noreferrer">The Discovery of Apache ZooKeeper’s Poison Packet</a>,” <em>pagerduty.com</em>, May 7, 2015.</li><li>Jonathan Stone and Craig Partridge: “<a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.27.7611&amp;rep=rep1&amp;type=pdf" target="_blank" rel="noreferrer">When the CRC and TCP Checksum Disagree</a>,” at <em>ACM Conference on Applications, Technologies, Architectures, and Protocols for Computer Communication</em> (SIGCOMM), August 2000. <a href="http://dx.doi.org/10.1145/347059.347561" target="_blank" rel="noreferrer">doi:10.1145/347059.347561</a></li><li>Evan Jones: “<a href="http://www.evanjones.ca/tcp-and-ethernet-checksums-fail.html" target="_blank" rel="noreferrer">How Both TCP and Ethernet Checksums Fail</a>,” <em>evanjones.ca</em>, October 5, 2015.</li><li>Cynthia Dwork, Nancy Lynch, and Larry Stockmeyer: “<a href="http://www.net.t-labs.tu-berlin.de/~petr/ADC-07/papers/DLS88.pdf" target="_blank" rel="noreferrer">Consensus in the Presence of Partial Synchrony</a>,” <em>Journal of the ACM</em>, volume 35, number 2, pages 288–323, April 1988. <a href="http://dx.doi.org/10.1145/42282.42283" target="_blank" rel="noreferrer">doi:10.1145/42282.42283</a></li><li>Peter Bailis and Ali Ghodsi: “<a href="http://queue.acm.org/detail.cfm?id=2462076" target="_blank" rel="noreferrer">Eventual Consistency Today: Limitations, Extensions, and Beyond</a>,” <em>ACM Queue</em>, volume 11, number 3, pages 55-63, March 2013. <a href="http://dx.doi.org/10.1145/2460276.2462076" target="_blank" rel="noreferrer">doi:10.1145/2460276.2462076</a></li><li>Bowen Alpern and Fred B. Schneider: “<a href="https://www.cs.cornell.edu/fbs/publications/DefLiveness.pdf" target="_blank" rel="noreferrer">Defining Liveness</a>,” <em>Information Processing Letters</em>, volume 21, number 4, pages 181–185, October 1985. <a href="http://dx.doi.org/10.1016/0020-0190(85)90056-0" target="_blank" rel="noreferrer">doi:10.1016/0020-0190(85)90056-0</a></li><li>Flavio P. Junqueira: “<a href="http://fpj.me/2015/05/28/dude-wheres-my-metadata/" target="_blank" rel="noreferrer">Dude, Where’s My Metadata?</a>,” <em>fpj.me</em>, May 28, 2015.</li><li>Scott Sanders: “<a href="https://github.com/blog/2106-january-28th-incident-report" target="_blank" rel="noreferrer">January 28th Incident Report</a>,” <em>github.com</em>, February 3, 2016.</li><li>Jay Kreps: “<a href="http://blog.empathybox.com/post/62279088548/a-few-notes-on-kafka-and-jepsen" target="_blank" rel="noreferrer">A Few Notes on Kafka and Jepsen</a>,” <em>blog.empathybox.com</em>, September 25, 2013.</li><li>Thanh Do, Mingzhe Hao, Tanakorn Leesatapornwongsa, et al.: “<a href="http://ucare.cs.uchicago.edu/pdf/socc13-limplock.pdf" target="_blank" rel="noreferrer">Limplock: Understanding the Impact of Limpware on Scale-out Cloud Systems</a>,” at <em>4th ACM Symposium on Cloud Computing</em> (SoCC), October 2013. <a href="http://dx.doi.org/10.1145/2523616.2523627" target="_blank" rel="noreferrer">doi:10.1145/2523616.2523627</a></li><li>Frank McSherry, Michael Isard, and Derek G. Murray: “<a href="http://www.frankmcsherry.org/assets/COST.pdf" target="_blank" rel="noreferrer">Scalability! But at What COST?</a>,” at <em>15th USENIX Workshop on Hot Topics in Operating Systems</em> (HotOS), May 2015.</li></ol>',25),l=[i];function s(m,h,c,d,u,p){return t(),r("div",null,l)}const y=a(n,[["render",s]]);export{b as __pageData,y as default};
