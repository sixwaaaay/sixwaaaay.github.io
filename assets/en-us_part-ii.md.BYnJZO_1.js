import{_ as e}from"./chunks/figii-1.B6cG2XWi.js";import{_ as a,c as t,o as i,a1 as o}from"./chunks/framework.biRBrEtS.js";const y=JSON.parse('{"title":"PART II: Distributed Data","description":"","frontmatter":{},"headers":[],"relativePath":"en-us/part-ii.md","filePath":"en-us/part-ii.md"}'),r={name:"en-us/part-ii.md"},s=o('<h1 id="part-ii-distributed-data" tabindex="-1">PART II: Distributed Data <a class="header-anchor" href="#part-ii-distributed-data" aria-label="Permalink to &quot;PART II: Distributed Data&quot;">​</a></h1><blockquote><p><em>For a successful technology, reality must take precedence over public relations, for nature cannot be fooled.</em></p><p>—Richard Feynman, <em>Rogers Commission Report</em> (1986)</p></blockquote><hr><p>In <a href="./part-i.html">Part I</a> of this book, we discussed aspects of data systems that apply when data is stored on a single machine. Now, in <a href="./part-ii.html">Part II</a>, we move up a level and ask: what hap‐ pens if multiple machines are involved in storage and retrieval of data?</p><p>There are various reasons why you might want to distribute a database across multi‐ ple machines:</p><p><em><strong>Scalability</strong></em></p><p>If your data volume, read load, or write load grows bigger than a single machine can handle, you can potentially spread the load across multiple machines.</p><p><em><strong>Fault tolerance/high availability</strong></em></p><p>If your application needs to continue working even if one machine (or several machines, or the network, or an entire datacenter) goes down, you can use multi‐ ple machines to give you redundancy. When one fails, another one can take over.</p><p><em><strong>Latency</strong></em></p><p>If you have users around the world, you might want to have servers at various locations worldwide so that each user can be served from a datacenter that is geo‐ graphically close to them. That avoids the users having to wait for network pack‐ ets to travel halfway around the world.</p><h2 id="scaling-to-higher-load" tabindex="-1">Scaling to Higher Load <a class="header-anchor" href="#scaling-to-higher-load" aria-label="Permalink to &quot;Scaling to Higher Load&quot;">​</a></h2><p>If all you need is to scale to higher load, the simplest approach is to buy a more pow‐ erful machine (sometimes called <em>vertical scaling</em> or <em>scaling up</em>). Many CPUs, many RAM chips, and many disks can be joined together under one operating system, and a fast interconnect allows any CPU to access any part of the memory or disk. In this kind of <em>shared-memory architecture</em>, all the components can be treated as a single machine [1].[^ii]</p><p>[^i]: In a large machine, although any CPU can access any part of memory, some banks of memory are closer to one CPU than to others (this is called nonuniform memory access, or NUMA [1]). To make efficient use of this architecture, the processing needs to be broken down so that each CPU mostly accesses memory that is nearby—which means that partitioning is still required, even when ostensibly running on one machine.</p><p>The problem with a shared-memory approach is that the cost grows faster than line‐ arly: a machine with twice as many CPUs, twice as much RAM, and twice as much disk capacity as another typically costs significantly more than twice as much. And due to bottlenecks, a machine twice the size cannot necessarily handle twice the load.</p><p>A shared-memory architecture may offer limited fault tolerance—high-end machines have hot-swappable components (you can replace disks, memory modules, and even CPUs without shutting down the machines)—but it is definitely limited to a single geographic location.</p><p>Another approach is the <em>shared-disk architecture</em>, which uses several machines with independent CPUs and RAM, but stores data on an array of disks that is shared between the machines, which are connected via a fast network.[^ii] This architecture is used for some data warehousing workloads, but contention and the overhead of lock‐ ing limit the scalability of the shared-disk approach [2].</p><p>[^ii]: Network Attached Storage (NAS) or Storage Area Network (SAN).</p><h3 id="shared-nothing-architectures" tabindex="-1">Shared-Nothing Architectures <a class="header-anchor" href="#shared-nothing-architectures" aria-label="Permalink to &quot;Shared-Nothing Architectures&quot;">​</a></h3><p>By contrast, <em>shared-nothing architectures</em> [3] (sometimes called <em>horizontal scaling</em> or <em>scaling out</em>) have gained a lot of popularity. In this approach, each machine or virtual machine running the database software is called a <em>node</em>. Each node uses its CPUs, RAM, and disks independently. Any coordination between nodes is done at the soft‐ ware level, using a conventional network.</p><p>No special hardware is required by a shared-nothing system, so you can use whatever machines have the best price/performance ratio. You can potentially distribute data across multiple geographic regions, and thus reduce latency for users and potentially be able to survive the loss of an entire datacenter. With cloud deployments of virtual machines, you don’t need to be operating at Google scale: even for small companies, a multi-region distributed architecture is now feasible.</p><p>In this part of the book, we focus on shared-nothing architectures—not because they are necessarily the best choice for every use case, but rather because they require the most caution from you, the application developer. If your data is distributed across multiple nodes, you need to be aware of the constraints and trade-offs that occur in such a distributed system—the database cannot magically hide these from you.</p><p>While a distributed shared-nothing architecture has many advantages, it usually also incurs additional complexity for applications and sometimes limits the expressive‐ ness of the data models you can use. In some cases, a simple single-threaded program can perform significantly better than a cluster with over 100 CPU cores [4]. On the other hand, shared-nothing systems can be very powerful. The next few chapters go into details on the issues that arise when data is distributed.</p><h3 id="replication-versus-partitioning" tabindex="-1">Replication Versus Partitioning <a class="header-anchor" href="#replication-versus-partitioning" aria-label="Permalink to &quot;Replication Versus Partitioning&quot;">​</a></h3><p>There are two common ways data is distributed across multiple nodes:</p><p><em><strong>Replication</strong></em></p><p>Keeping a copy of the same data on several different nodes, potentially in differ‐ ent locations. Replication provides redundancy: if some nodes are unavailable, the data can still be served from the remaining nodes. Replication can also help improve performance. We discuss replication in <a href="./ch5.html">Chapter 5</a>.</p><p><em><strong>Partitioning</strong></em></p><p>Splitting a big database into smaller subsets called <em>partitions</em> so that different par‐ titions can be assigned to different nodes (also known as <em>sharding</em>). We discuss partitioning in <a href="./ch6.html">Chapter 6</a>.</p><p>These are separate mechanisms, but they often go hand in hand, as illustrated in Figure II-1.</p><p><img src="'+e+'" alt=""></p><blockquote><p><em>Figure II-1. A database split into two partitions, with two replicas per partition.</em></p></blockquote><p>With an understanding of those concepts, we can discuss the difficult trade-offs that you need to make in a distributed system. We’ll discuss <em>transactions</em> in Chapter 7, as that will help you understand all the many things that can go wrong in a data system, and what you can do about them. We’ll conclude this part of the book by discussing the fundamental limitations of distributed systems in Chapters 8 and 9.</p><p>Later, in Part III of this book, we will discuss how you can take several (potentially distributed) datastores and integrate them into a larger system, satisfying the needs of a complex application. But first, let’s talk about distributed data.</p><h2 id="references" tabindex="-1">References <a class="header-anchor" href="#references" aria-label="Permalink to &quot;References&quot;">​</a></h2><ol><li><p>Ulrich Drepper: “<a href="https://people.freebsd.org/~lstewart/articles/cpumemory.pdf" target="_blank" rel="noreferrer">What Every Programmer Should Know About Memory</a>,” akka‐dia.org, November 21, 2007.</p></li><li><p>Ben Stopford: “<a href="http://www.benstopford.com/2009/11/24/understanding-the-shared-nothing-architecture/" target="_blank" rel="noreferrer">Shared Nothing vs. Shared Disk Architectures: An Independent View</a>,” benstopford.com, November 24, 2009.</p></li><li><p>Michael Stonebraker: “<a href="http://db.cs.berkeley.edu/papers/hpts85-nothing.pdf" target="_blank" rel="noreferrer">The Case for Shared Nothing</a>,” IEEE Database EngineeringBulletin, volume 9, number 1, pages 4–9, March 1986.</p></li><li><p>Frank McSherry, Michael Isard, and Derek G. Murray: “<a href="http://www.frankmcsherry.org/assets/COST.pdf" target="_blank" rel="noreferrer">Scalability! But at What COST?</a>,” at 15th USENIX Workshop on Hot Topics in Operating Systems (HotOS),May 2015.</p></li></ol>',36),n=[s];function h(c,l,d,p,m,u){return i(),t("div",null,n)}const b=a(r,[["render",h]]);export{y as __pageData,b as default};
