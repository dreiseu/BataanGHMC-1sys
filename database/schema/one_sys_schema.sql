-- ===========================================================================================
-- EMR+ Database Schema
-- Database: one_sys
-- ===========================================================================================

/****** Object:  Table [dbo].[directory_entries]    Script Date: 6/25/2026 1:14:24 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[directory_entries](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[department] [nvarchar](255) NOT NULL,
	[local_no] [nvarchar](20) NOT NULL,
	[section] [nvarchar](255) NOT NULL,
	[is_active] [bit] NOT NULL,
	[sort_order] [int] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[directory_entries] ADD  DEFAULT ('BataanGHMC') FOR [section]
GO

ALTER TABLE [dbo].[directory_entries] ADD  DEFAULT ('1') FOR [is_active]
GO

ALTER TABLE [dbo].[directory_entries] ADD  DEFAULT ('0') FOR [sort_order]
GO

/****** Object:  Table [dbo].[hospital_systems]    Script Date: 6/25/2026 1:14:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[hospital_systems](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[url] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[imiss_ticket_comments]    Script Date: 6/25/2026 1:15:05 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[imiss_ticket_comments](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[ticket_id] [bigint] NOT NULL,
	[sender_bioid] [nvarchar](255) NOT NULL,
	[sender_name] [nvarchar](255) NOT NULL,
	[message] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[attachment_path] [nvarchar](255) NULL,
	[attachments] [nvarchar](max) NULL,
	[read_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[imiss_ticket_comments]  WITH CHECK ADD  CONSTRAINT [imiss_ticket_comments_ticket_id_foreign] FOREIGN KEY([ticket_id])
REFERENCES [dbo].[imiss_tickets] ([id])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[imiss_ticket_comments] CHECK CONSTRAINT [imiss_ticket_comments_ticket_id_foreign]
GO

/****** Object:  Table [dbo].[imiss_tickets]    Script Date: 6/25/2026 1:15:15 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[imiss_tickets](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[ticket_number] [nvarchar](255) NOT NULL,
	[bio_id] [nvarchar](255) NOT NULL,
	[request_type] [nvarchar](255) NULL,
	[description] [nvarchar](max) NOT NULL,
	[location] [nvarchar](255) NULL,
	[local_number] [nvarchar](255) NULL,
	[priority] [nvarchar](255) NOT NULL,
	[attachments] [nvarchar](max) NULL,
	[status] [nvarchar](255) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[remarks] [nvarchar](max) NULL,
	[accepted_by_name] [nvarchar](255) NULL,
	[accepted_at] [datetime] NULL,
	[rating] [tinyint] NULL,
	[feedback_text] [nvarchar](max) NULL,
	[pc_number] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[imiss_tickets] ADD  DEFAULT ('normal') FOR [priority]
GO

ALTER TABLE [dbo].[imiss_tickets] ADD  DEFAULT ('Ticket Submitted') FOR [status]
GO

/****** Object:  Table [dbo].[user_notifications]    Script Date: 6/25/2026 1:16:26 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[user_notifications](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[bioid] [nvarchar](255) NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[message] [nvarchar](255) NOT NULL,
	[link] [nvarchar](255) NULL,
	[is_read] [bit] NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[user_notifications] ADD  DEFAULT ('0') FOR [is_read]
GO

/****** Object:  Table [dbo].[user_preferences]    Script Date: 6/25/2026 1:16:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[user_preferences](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[bioid] [nvarchar](255) NOT NULL,
	[pinned_modules] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO


